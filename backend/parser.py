import logging
from models import JDRequirement, ResumeSkill
logger = logging.getLogger(__name__)

ALIAS = {
    "js":"javascript","ts":"typescript","py":"python","ml":"machine learning",
    "k8s":"kubernetes","dl":"deep learning","nlp":"natural language processing",
    "oop":"object oriented programming","ci/cd":"ci cd","aws":"amazon web services",
    "gcp":"google cloud platform","pg":"postgresql","postgres":"postgresql",
    "tf":"tensorflow","pytorch":"deep learning","node":"node.js","nodejs":"node.js",
    "react.js":"react","reactjs":"react","vuejs":"vue.js","angularjs":"angular","springboot":"spring boot",
}

def normalize_skill_name(name):
    c = name.lower().strip()
    return ALIAS.get(c, c)

def extract_text_from_pdf(file_bytes):
    try:
        import fitz
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = "\n".join(p.get_text() for p in doc)
        doc.close()
        return text
    except Exception as e:
        logger.error(f"PDF error: {e}")
        return ""

def extract_skills_from_resume(text):
    from ai_client import call_gemini_json
    system = (
        "You are an HR analyst. Extract ALL skills from this resume.\n"
        'Return JSON array: [{"name":str,"category":str,"proficiency_level":int,"years_experience":float,"evidence":str}]\n'
        "Categories: programming_language,framework,tool,soft_skill,domain_knowledge,operational,administrative\n"
        "Return ONLY valid JSON array. No markdown."
    )
    data = call_gemini_json(system, f"RESUME:\n{text[:8000]}", max_tokens=2048)
    skills = []
    for item in data:
        try:
            item["name"] = normalize_skill_name(item.get("name",""))
            skills.append(ResumeSkill(**item))
        except Exception as e:
            logger.warning(f"Skip skill: {e}")
    return skills

def extract_requirements_from_jd(text):
    from ai_client import call_gemini_json
    system = (
        "You are an HR analyst. Extract ALL required skills from this job description.\n"
        'Return JSON array: [{"name":str,"category":str,"required_level":int,"is_mandatory":bool,"context":str,"job_market_relevance_pct":int}]\n'
        "Return ONLY valid JSON array. No markdown."
    )
    data = call_gemini_json(system, f"JD:\n{text[:8000]}", max_tokens=2048)
    reqs = []
    for item in data:
        try:
            item["name"] = normalize_skill_name(item.get("name",""))
            reqs.append(JDRequirement(**item))
        except Exception as e:
            logger.warning(f"Skip req: {e}")
    return reqs

def extract_candidate_name(text):
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    for line in lines[:5]:
        if len(line) < 60 and "@" not in line and not any(c.isdigit() for c in line) and len(line.split()) >= 2:
            return line
    return None

def extract_target_role(text):
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    return lines[0][:100] if lines else "Target Role"
