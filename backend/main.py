"""
main.py — Gaplytics FastAPI v5.0.0 (Gemini native SDK)
"""
import logging, os, uuid
from datetime import date, datetime
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai_client import call_gemini, is_configured, DEFAULT_MODEL
from adaptive import generate_learning_pathway
from chat import generate_chat_response
from hr_store import add_candidate, get_all_roles, get_candidates, get_role, load_from_disk, save_role
from interview import evaluate_interview, generate_interview_questions, generate_practice_feedback
from models import (
    AnalysisResult, CandidateSummary, ChatRequest, ChatResponse,
    ComparisonResult, HRRole, InterviewEvaluation, InterviewSession, JDRequirement,
)
from parser import (
    extract_candidate_name, extract_requirements_from_jd,
    extract_skills_from_resume, extract_target_role, extract_text_from_pdf,
)
from skill_gap import compute_skill_gap

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("gaplytics")

FRONTEND_URL       = os.getenv("FRONTEND_URL", "http://localhost:5173")
SEMANTIC_THRESHOLD = float(os.getenv("SEMANTIC_THRESHOLD", "0.75"))

app = FastAPI(
    title="Gaplytics API",
    description="AI-Adaptive Onboarding Engine — Close the Gap. Own the Role.",
    version="5.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request, call_next):
    start = datetime.now()
    response = await call_next(request)
    ms = (datetime.now() - start).total_seconds() * 1000
    logger.info(f"{request.method} {request.url.path} → {response.status_code} ({ms:.0f}ms)")
    return response

@app.on_event("startup")
async def startup_event():
    load_from_disk()
    token = os.getenv("AWS_BEARER_TOKEN_BEDROCK", "").strip()
    if token:
        logger.info(f"✓ AWS_BEARER_TOKEN_BEDROCK found (...{token[-6:]}) — model: {DEFAULT_MODEL}")
    else:
        logger.error("✗ AWS_BEARER_TOKEN_BEDROCK not set. Add to backend/.env")
    logger.info("Gaplytics v5.0.0 ready.")

@app.get("/api/health")
async def health():
    token = os.getenv("AWS_BEARER_TOKEN_BEDROCK", "").strip()
    return {"status": "ok", "version": "5.0.0", "ai": "AWS Bedrock (Claude 3 Haiku)", "configured": is_configured(), "model": DEFAULT_MODEL, "token": f"...{token[-6:]}" if token else "NOT SET"}

@app.get("/api/ping")
async def ping():
    if not is_configured():
        return {"ok": False, "error": "AWS_BEARER_TOKEN_BEDROCK not set"}
    try:
        reply = call_gemini("Reply with exactly: GAPLYTICS_OK", "ping", max_tokens=10)
        return {"ok": True, "model": DEFAULT_MODEL, "reply": reply}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/api/analyze", response_model=AnalysisResult)
async def analyze(
    resume_file:   UploadFile        = File(...),
    deadline_date: str               = Form(...),
    daily_hours:   float             = Form(2.0),
    jd_text:       Optional[str]     = Form(None),
    jd_file:       Optional[UploadFile] = File(None),
    role_id:       Optional[str]     = Form(None),
):
    if not resume_file.filename.lower().endswith(".pdf"):
        raise HTTPException(422, "Resume must be a PDF.")
    resume_bytes = await resume_file.read()
    if len(resume_bytes) > 5 * 1024 * 1024:
        raise HTTPException(422, "Resume exceeds 5MB.")

    try:
        deadline = date.fromisoformat(deadline_date)
    except ValueError:
        raise HTTPException(422, "Invalid date. Use YYYY-MM-DD.")
    if deadline <= date.today():
        raise HTTPException(422, "Deadline must be in the future.")

    jd_source = ""
    hr_reqs: list[JDRequirement] = []
    role_override = ""

    if role_id:
        role = get_role(role_id)
        if not role: raise HTTPException(404, f"Role {role_id} not found.")
        hr_reqs = role.required_skills
        jd_source = "\n".join(f"{r.name}: {r.context}" for r in hr_reqs)
        role_override = role.role_title
        if role.company_deadline < deadline:
            deadline = role.company_deadline
    elif jd_file and jd_file.filename:
        if not jd_file.filename.lower().endswith(".pdf"):
            raise HTTPException(422, "JD must be PDF.")
        jd_source = extract_text_from_pdf(await jd_file.read())
    elif jd_text and jd_text.strip():
        jd_source = jd_text
    else:
        raise HTTPException(422, "Job description required.")

    resume_text = extract_text_from_pdf(resume_bytes)
    if not resume_text.strip():
        raise HTTPException(422, "Could not read resume PDF. Ensure it is text-based.")

    try:
        resume_skills = extract_skills_from_resume(resume_text)
    except RuntimeError as e:
        raise HTTPException(503, str(e))
    except Exception as e:
        logger.error(f"Resume extraction error: {e}")
        raise HTTPException(502, f"AI error: {e}")

    if not resume_skills:
        raise HTTPException(422, "No skills found in resume.")

    try:
        jd_requirements = hr_reqs if hr_reqs else extract_requirements_from_jd(jd_source)
    except RuntimeError as e:
        raise HTTPException(503, str(e))
    except Exception as e:
        logger.error(f"JD extraction error: {e}")
        raise HTTPException(502, f"AI error: {e}")

    if not jd_requirements:
        raise HTTPException(422, "No requirements found in JD.")

    candidate_name = extract_candidate_name(resume_text)
    target_role    = role_override or extract_target_role(jd_source)

    gap_result = compute_skill_gap(
        resume_skills=resume_skills, jd_requirements=jd_requirements,
        target_role=target_role, candidate_name=candidate_name,
        semantic_threshold=SEMANTIC_THRESHOLD,
    )
    pathway, modules_detail = generate_learning_pathway(
        gap_result=gap_result, deadline_date=deadline, daily_hours=daily_hours,
    )

    analysis_id = str(uuid.uuid4())
    result = AnalysisResult(analysis_id=analysis_id, gap_result=gap_result, pathway=pathway, modules_detail=modules_detail)

    if role_id:
        days = (deadline - date.today()).days
        pred = max(1, int(days * (0.3 if gap_result.overall_match_percentage >= 90 else 0.6 if gap_result.overall_match_percentage >= 70 else 0.8)))
        add_candidate(role_id, CandidateSummary(
            name=candidate_name or "Unknown",
            match_pct=gap_result.overall_match_percentage,
            top_gaps=[g.skill_name for g in gap_result.gap_skills[:3]],
            status="not_started", progress_pct=0.0,
            predicted_days_to_competency=pred, analysis_id=analysis_id,
        ))
    return result

@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    return ChatResponse(response=generate_chat_response(req.message, req.analysis_context))

class InterviewGenReq(BaseModel):
    gap_skills: list[str]; target_role: str; candidate_skills: list[str]; analysis_id: str

@app.post("/api/interview/generate")
async def gen_interview(req: InterviewGenReq):
    q = generate_interview_questions(req.gap_skills, req.target_role, req.candidate_skills)
    return {"questions": [x.model_dump() for x in q]}

@app.post("/api/interview/evaluate", response_model=InterviewEvaluation)
async def eval_interview(session: InterviewSession):
    return evaluate_interview(session)

class FeedbackReq(BaseModel):
    question: str; answer: str; skill_context: str

@app.post("/api/interview/feedback")
async def feedback(req: FeedbackReq):
    return {"feedback": generate_practice_feedback(req.question, req.answer, req.skill_context)}

@app.post("/api/hr/create-role")
async def create_role(
    role_title: str = Form(...), company_deadline: str = Form(...),
    daily_hours: float = Form(2.0),
    jd_text: Optional[str] = Form(None), jd_file: Optional[UploadFile] = File(None),
):
    jd = ""
    if jd_file and jd_file.filename:
        jd = extract_text_from_pdf(await jd_file.read())
    elif jd_text and jd_text.strip():
        jd = jd_text
    else:
        raise HTTPException(422, "JD required.")
    try:
        deadline = date.fromisoformat(company_deadline)
    except ValueError:
        raise HTTPException(422, "Invalid date.")
    if deadline <= date.today():
        raise HTTPException(422, "Deadline must be future.")
    try:
        skills = extract_requirements_from_jd(jd)
    except Exception as e:
        raise HTTPException(502, f"AI error: {e}")
    if not skills:
        raise HTTPException(422, "No skills found in JD.")
    role = HRRole(role_title=role_title, required_skills=skills, company_deadline=deadline, daily_hours=daily_hours)
    save_role(role)
    return {"role_id": role.role_id, "role_title": role.role_title, "required_skills": [s.model_dump() for s in skills], "candidate_url": f"/candidate?role_id={role.role_id}"}

@app.get("/api/hr/role/{role_id}")
async def get_role_detail(role_id: str):
    role = get_role(role_id)
    if not role: raise HTTPException(404, "Role not found.")
    candidates = get_candidates(role_id)
    avg = sum(c.match_pct for c in candidates) / len(candidates) if candidates else 0.0
    return {**role.model_dump(), "candidates": [c.model_dump() for c in candidates], "team_avg_match": round(avg, 1)}

@app.get("/api/hr/roles")
async def list_roles():
    return {"roles": [r.model_dump() for r in get_all_roles()]}

@app.get("/api/hr/candidates/{role_id}")
async def list_candidates(role_id: str):
    return {"candidates": [c.model_dump() for c in get_candidates(role_id)]}

class CompareReq(BaseModel):
    candidate_id_a: str; candidate_id_b: str; role_id: str

@app.post("/api/hr/compare", response_model=ComparisonResult)
async def compare(req: CompareReq):
    candidates = get_candidates(req.role_id)
    a = next((c for c in candidates if c.candidate_id == req.candidate_id_a), None)
    b = next((c for c in candidates if c.candidate_id == req.candidate_id_b), None)
    if not a or not b: raise HTTPException(404, "Candidates not found.")
    try:
        verdict = call_gemini(
            "You are an HR analyst. Be direct.",
            f"Compare: A={a.name} {a.match_pct}% gaps={a.top_gaps} ready={a.predicted_days_to_competency}d. B={b.name} {b.match_pct}% gaps={b.top_gaps} ready={b.predicted_days_to_competency}d. 2 sentences, recommend one.",
            max_tokens=150,
        )
    except Exception:
        w = a if a.match_pct >= b.match_pct else b
        verdict = f"{w.name} is the stronger candidate at {w.match_pct}% match, ready in {w.predicted_days_to_competency} days."
    return ComparisonResult(
        candidate_a=a, candidate_b=b, ai_verdict=verdict,
        skill_comparison_table=[{"skill": s, "candidate_a_has": s not in a.top_gaps, "candidate_b_has": s not in b.top_gaps} for s in set(a.top_gaps + b.top_gaps)],
    )
