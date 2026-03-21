"""
interview.py — Mock Technical Interview generation + 9-dimension evaluation via Grok (xAI).
"""
import json
import logging
import uuid
from datetime import datetime

from models import (
    DimensionScore, InterviewEvaluation, InterviewQuestion, InterviewSession,
)

logger = logging.getLogger(__name__)

ALL_DIMENSIONS = [
    "decision_making", "debugging_ability", "code_correctness",
    "code_quality", "incident_diagnosis", "algorithmic_thinking",
    "communication_clarity", "adaptability_under_pressure", "technical_depth",
]

# ── Fallback questions (used when Grok is unavailable) ───────────────────────
FALLBACK_QUESTIONS: list[InterviewQuestion] = [
    InterviewQuestion(
        id=str(uuid.uuid4()), question_type="scenario_decision",
        question_text=(
            "A production API is returning 500 errors for 5% of requests. "
            "Your CTO wants a fix deployed in 2 hours. Describe your step-by-step "
            "diagnosis and resolution approach while minimising downtime risk."
        ),
        expected_skill="system design",
    ),
    InterviewQuestion(
        id=str(uuid.uuid4()), question_type="scenario_decision",
        question_text=(
            "Your team is 3 sprints behind on a critical feature. A high-value client "
            "just submitted an urgent new request. How do you communicate this to "
            "stakeholders and decide which to prioritise?"
        ),
        expected_skill="stakeholder management",
    ),
    InterviewQuestion(
        id=str(uuid.uuid4()), question_type="debug_the_code",
        question_text="This Python function should return the sum of all even numbers but raises SyntaxError. What is the bug?",
        code_snippet=(
            "def sum_evens(numbers):\n"
            "    total = 0\n"
            "    for n in numbers:\n"
            "        if n % 2 = 0:  # BUG\n"
            "            total += n\n"
            "    return total"
        ),
        expected_skill="python",
    ),
    InterviewQuestion(
        id=str(uuid.uuid4()), question_type="debug_the_code",
        question_text="This async function always returns undefined. What is the bug?",
        code_snippet=(
            "async function getUser(id) {\n"
            "  fetch(`/api/users/${id}`)\n"
            "    .then(res => res.json())\n"
            "    .then(data => { return data; }); // return inside .then(), not outer fn\n"
            "}"
        ),
        expected_skill="javascript",
    ),
    InterviewQuestion(
        id=str(uuid.uuid4()), question_type="fix_the_code",
        question_text="This fibonacci function returns wrong results for inputs > 2. Write the corrected version.",
        code_snippet=(
            "def fibonacci(n):\n"
            "    if n <= 0: return 0\n"
            "    elif n == 1: return 1\n"
            "    else: return fibonacci(n-1) + fibonacci(n-3)  # BUG: n-3 → n-2"
        ),
        expected_skill="python",
    ),
    InterviewQuestion(
        id=str(uuid.uuid4()), question_type="fix_the_code",
        question_text="This SQL query always returns empty results for the last 30 days. Fix it.",
        code_snippet=(
            "SELECT u.name, u.email\n"
            "FROM users u INNER JOIN orders o ON u.id = o.user_id\n"
            "WHERE o.created_at = DATE_SUB(NOW(), INTERVAL 30 DAY);\n"
            "-- BUG: = should be >= for a date range"
        ),
        expected_skill="sql",
    ),
    InterviewQuestion(
        id=str(uuid.uuid4()), question_type="code_review",
        question_text="Review this Python REST endpoint. What security vulnerabilities and quality issues do you see?",
        code_snippet=(
            '@app.route("/user/<id>")\n'
            "def get_user(id):\n"
            '    user = db.execute("SELECT * FROM users WHERE id=" + id)  # SQL injection\n'
            "    if user:\n"
            "        return user[0]  # raw DB row — no serialisation\n"
            "    return None  # should be HTTP 404"
        ),
        expected_skill="rest api",
    ),
    InterviewQuestion(
        id=str(uuid.uuid4()), question_type="code_review",
        question_text="Review this React component. Identify all bugs and anti-patterns.",
        code_snippet=(
            "function UserList() {\n"
            "  const [users, setUsers] = useState([]);\n"
            "  fetch('/api/users')              // BUG 1: runs every render\n"
            "    .then(r => r.json())\n"
            "    .then(data => setUsers(data)); // BUG 2: infinite re-render loop\n"
            "  return users.map(u => <div>{u.name}</div>); // BUG 3: no key prop\n"
            "}"
        ),
        expected_skill="react",
    ),
    InterviewQuestion(
        id=str(uuid.uuid4()), question_type="log_detective",
        question_text="Analyse this Node.js error log. What caused the crash and how would you fix it?",
        code_snippet=(
            "[2024-01-15 14:23:07] ERROR: Unhandled promise rejection\n"
            "Error: Cannot read property 'email' of undefined\n"
            "    at UserService.sendWelcomeEmail (services/user.js:47)\n"
            "    at async routes/auth.js:23\n\n"
            "POST /api/auth/register → 500\n"
            'Request body: {"username": "john_doe", "password": "***"}\n'
            "DB query result: null  ← user insert failed silently"
        ),
        expected_skill="node.js",
    ),
    InterviewQuestion(
        id=str(uuid.uuid4()), question_type="log_detective",
        question_text="Examine this Kubernetes CrashLoopBackOff log. What is the root cause?",
        code_snippet=(
            "[pod: api-deployment-7d9f8b-xk2p9]\n"
            "ERROR: connect ECONNREFUSED 10.96.0.5:5432\n"
            "Error: Database connection failed after 3 retries — exit code 1\n\n"
            "Warning  BackOff    kubelet  Back-off restarting failed container\n"
            "CrashLoopBackOff: restarting (exit code 1)"
        ),
        expected_skill="kubernetes",
    ),
    InterviewQuestion(
        id=str(uuid.uuid4()), question_type="complexity_analysis",
        question_text="Analyse the time and space complexity of this function step by step.",
        code_snippet=(
            "def find_duplicates(arr):\n"
            "    seen = set()\n"
            "    duplicates = []\n"
            "    for item in arr:        # O(n)\n"
            "        if item in seen:    # O(1) average\n"
            "            duplicates.append(item)\n"
            "        else:\n"
            "            seen.add(item)\n"
            "    return duplicates"
        ),
        expected_skill="algorithms",
    ),
    InterviewQuestion(
        id=str(uuid.uuid4()), question_type="complexity_analysis",
        question_text="What is the time and space complexity of bubble sort? Why is it rarely used in production?",
        code_snippet=(
            "def bubble_sort(arr):\n"
            "    n = len(arr)\n"
            "    for i in range(n):\n"
            "        for j in range(0, n-i-1):\n"
            "            if arr[j] > arr[j+1]:\n"
            "                arr[j], arr[j+1] = arr[j+1], arr[j]\n"
            "    return arr"
        ),
        expected_skill="algorithms",
    ),
]


def _neutral_evaluation(adaptability_score: float) -> InterviewEvaluation:
    dimension_scores = [
        DimensionScore(
            dimension=dim,
            score=round(adaptability_score if dim == "adaptability_under_pressure" else 5.0, 1),
            feedback="Evaluation completed. Review your answers for detailed feedback.",
            is_strength=False,
        )
        for dim in ALL_DIMENSIONS
    ]
    return InterviewEvaluation(
        dimension_scores=dimension_scores,
        overall_score=5.0,
        verdict="STRONG_CANDIDATE",
        hire_ready=False,
        per_question_feedback=[],
        evaluated_at=datetime.now(),
    )


def generate_interview_questions(
    gap_skills: list[str],
    target_role: str,
    candidate_skills: list[str],
) -> list[InterviewQuestion]:
    system = (
        f"Generate exactly 12 technical interview questions for a {target_role} position.\n"
        f"Candidate known skills: {', '.join(candidate_skills[:10])}.\n"
        f"Focus on these gap skill areas: {', '.join(gap_skills[:8])}.\n"
        "Distribute EXACTLY: 2 scenario_decision, 2 debug_the_code, 2 fix_the_code, "
        "2 code_review, 2 log_detective, 2 complexity_analysis.\n"
        "For debug_the_code, fix_the_code, code_review, complexity_analysis: "
        "include a realistic code_snippet in the most relevant language.\n"
        "For log_detective: include a realistic error log in code_snippet.\n"
        "Return ONLY a valid JSON array of exactly 12 objects — no markdown:\n"
        '[{"id":"q1","question_type":"scenario_decision","question_text":"...",'
        '"code_snippet":null,"expected_skill":"...","time_limit_seconds":300}]'
    )
    try:
        from ai_client import call_gemini_json
        data = call_gemini_json(system, "Generate the 12 questions now.", max_tokens=4000)
        questions = []
        for item in data:
            try:
                item["id"] = str(uuid.uuid4())
                questions.append(InterviewQuestion(**item))
            except Exception as e:
                logger.warning(f"Skipping malformed question: {e}")
        if len(questions) == 12:
            logger.info("Gemini generated 12 interview questions successfully.")
            return questions
        logger.warning(f"Gemini returned {len(questions)} questions (expected 12). Using fallback.")
        return FALLBACK_QUESTIONS
    except RuntimeError:
        logger.warning("Gemini not configured — using fallback questions")
        return FALLBACK_QUESTIONS
    except Exception as e:
        logger.error(f"Interview question generation error: {type(e).__name__}: {e}")
        return FALLBACK_QUESTIONS


def evaluate_interview(session: InterviewSession) -> InterviewEvaluation:
    role     = session.candidate_context.target_role
    skips    = sum(1 for a in session.answers if a.was_skipped)
    timeouts = sum(1 for a in session.answers if a.was_timeout)
    avg_time = (
        sum(a.time_taken_seconds for a in session.answers) / len(session.answers)
        if session.answers else 0
    )
    adaptability_score = max(0.0, 8.0 - skips * 1.0 - timeouts * 0.5)

    qa_pairs = [
        {
            "type":         q.question_type,
            "question":     q.question_text,
            "code_snippet": q.code_snippet or "",
            "answer":       a.answer_text,
            "time_taken":   a.time_taken_seconds,
            "skipped":      a.was_skipped,
            "timeout":      a.was_timeout,
        }
        for q, a in zip(session.questions, session.answers)
    ]

    system = (
        f"You are a senior technical interviewer evaluating a {role} candidate.\n"
        f"Timer summary: avg_time={avg_time:.0f}s, skips={skips}, timeouts={timeouts}.\n\n"
        f"Q&A pairs:\n{json.dumps(qa_pairs, indent=2)[:6000]}\n\n"
        "Evaluate across exactly these 9 dimensions:\n"
        "  decision_making, debugging_ability, code_correctness, code_quality,\n"
        "  incident_diagnosis, algorithmic_thinking, communication_clarity,\n"
        "  adaptability_under_pressure, technical_depth\n\n"
        "For adaptability_under_pressure: base=8.0, subtract 1.0 per skip, 0.5 per timeout.\n"
        "Return ONLY valid JSON — no markdown:\n"
        '{"dimension_scores":[{"dimension":"decision_making","score":7.5,"feedback":"...","is_strength":true}],'
        '"overall_score":7.2,"verdict":"STRONG_CANDIDATE",'
        '"per_question_feedback":[{"question_id":"id","feedback":"...","ideal_answer":"..."}]}'
    )

    try:
        from ai_client import call_gemini_json
        data = call_gemini_json(system, "Evaluate the interview now.", max_tokens=3000)

        score_map = {d["dimension"]: d for d in data.get("dimension_scores", [])}
        dimension_scores = []
        for dim in ALL_DIMENSIONS:
            if dim in score_map:
                d = score_map[dim]
                raw = adaptability_score if dim == "adaptability_under_pressure" else float(d.get("score", 5.0))
                score = round(min(10.0, max(0.0, raw)), 1)
                dimension_scores.append(DimensionScore(
                    dimension=dim, score=score,
                    feedback=d.get("feedback", "Good effort."),
                    is_strength=d.get("is_strength", score >= 7.0),
                ))
            else:
                default = adaptability_score if dim == "adaptability_under_pressure" else 5.0
                dimension_scores.append(DimensionScore(
                    dimension=dim, score=round(default, 1),
                    feedback="Assessment based on submitted answers.",
                    is_strength=default >= 7.0,
                ))

        overall = round(min(10.0, max(0.0, float(
            data.get("overall_score", sum(d.score for d in dimension_scores) / 9)
        ))), 1)
        verdict = (
            "HIRE_READY"        if overall >= 8.0 else
            "STRONG_CANDIDATE"  if overall >= 6.0 else
            "NEEDS_MORE_PREP"
        )
        return InterviewEvaluation(
            dimension_scores=dimension_scores,
            overall_score=overall,
            verdict=verdict,
            hire_ready=overall >= 8.0,
            per_question_feedback=data.get("per_question_feedback", []),
            evaluated_at=datetime.now(),
        )

    except Exception as e:
        logger.error(f"Interview evaluation error: {type(e).__name__}: {e}")
        return _neutral_evaluation(adaptability_score)


def generate_practice_feedback(question: str, answer: str, skill_context: str) -> str:
    system = (
        f"You are a technical interviewer. Give concise feedback on this practice answer.\n"
        f"Skill context: {skill_context}\n"
        "Provide 2-3 sentences of specific, actionable feedback. "
        "Mention what was good and what could be improved. Be encouraging."
    )
    try:
        from ai_client import call_gemini
        return call_gemini(system, f"Question: {question}\nAnswer: {answer}", max_tokens=300)
    except Exception as e:
        logger.error(f"Practice feedback error: {type(e).__name__}: {e}")
        return (
            "Good attempt! Focus on being more specific and structured. "
            "Think about edge cases and error handling to strengthen your answer."
        )
