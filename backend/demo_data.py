"""
demo_data.py — Seed dummy data for hackathon demo.

Run once before the demo:
    python demo_data.py

Creates 2 HR roles with 5 pre-loaded candidates.
"""
import json, uuid
from datetime import date, timedelta, datetime

def seed():
    today = date.today()

    data = {
        "roles": {
            "demo-role-001": {
                "role_id": "demo-role-001",
                "role_title": "Senior Backend Engineer",
                "required_skills": [
                    {"name": "python",        "category": "programming_language", "required_level": 8, "is_mandatory": True,  "context": "5+ years Python required",          "job_market_relevance_pct": 82},
                    {"name": "docker",        "category": "tool",                 "required_level": 7, "is_mandatory": True,  "context": "Docker for containerization",       "job_market_relevance_pct": 78},
                    {"name": "system design", "category": "domain_knowledge",     "required_level": 8, "is_mandatory": True,  "context": "Design scalable distributed systems","job_market_relevance_pct": 72},
                    {"name": "kubernetes",    "category": "tool",                 "required_level": 6, "is_mandatory": False, "context": "K8s for container orchestration",   "job_market_relevance_pct": 58},
                    {"name": "fastapi",       "category": "framework",            "required_level": 7, "is_mandatory": True,  "context": "Build REST APIs with FastAPI",      "job_market_relevance_pct": 45},
                    {"name": "postgresql",    "category": "tool",                 "required_level": 7, "is_mandatory": True,  "context": "PostgreSQL database experience",    "job_market_relevance_pct": 70},
                ],
                "company_deadline": (today + timedelta(days=60)).isoformat(),
                "daily_hours": 2.0,
                "candidates": [],
                "created_at": datetime.now().isoformat(),
            },
            "demo-role-002": {
                "role_id": "demo-role-002",
                "role_title": "ML Engineer",
                "required_skills": [
                    {"name": "python",                    "category": "programming_language", "required_level": 9, "is_mandatory": True,  "context": "Advanced Python for ML pipelines",    "job_market_relevance_pct": 88},
                    {"name": "machine learning",          "category": "domain_knowledge",     "required_level": 8, "is_mandatory": True,  "context": "Build and evaluate ML models",        "job_market_relevance_pct": 65},
                    {"name": "deep learning",             "category": "domain_knowledge",     "required_level": 7, "is_mandatory": False, "context": "Neural network architectures",        "job_market_relevance_pct": 55},
                    {"name": "natural language processing","category": "domain_knowledge",    "required_level": 7, "is_mandatory": False, "context": "NLP and LLM integration",             "job_market_relevance_pct": 48},
                    {"name": "pandas",                    "category": "framework",            "required_level": 8, "is_mandatory": True,  "context": "Data manipulation with Pandas/NumPy", "job_market_relevance_pct": 75},
                    {"name": "amazon web services",       "category": "tool",                 "required_level": 6, "is_mandatory": False, "context": "Deploy models on AWS SageMaker",      "job_market_relevance_pct": 69},
                ],
                "company_deadline": (today + timedelta(days=45)).isoformat(),
                "daily_hours": 3.0,
                "candidates": [],
                "created_at": datetime.now().isoformat(),
            },
        },
        "candidates": {
            "demo-role-001": [
                {
                    "candidate_id": "demo-cand-001",
                    "name": "Priya Sharma",
                    "match_pct": 82.5,
                    "top_gaps": ["docker", "kubernetes", "system design"],
                    "status": "in_progress",
                    "progress_pct": 35.0,
                    "predicted_days_to_competency": 28,
                    "analysis_id": str(uuid.uuid4()),
                },
                {
                    "candidate_id": "demo-cand-002",
                    "name": "Arjun Mehta",
                    "match_pct": 91.0,
                    "top_gaps": ["kubernetes"],
                    "status": "on_track",
                    "progress_pct": 72.0,
                    "predicted_days_to_competency": 12,
                    "analysis_id": str(uuid.uuid4()),
                },
                {
                    "candidate_id": "demo-cand-003",
                    "name": "Sarah Chen",
                    "match_pct": 64.0,
                    "top_gaps": ["fastapi", "docker", "system design"],
                    "status": "behind",
                    "progress_pct": 18.0,
                    "predicted_days_to_competency": 48,
                    "analysis_id": str(uuid.uuid4()),
                },
            ],
            "demo-role-002": [
                {
                    "candidate_id": "demo-cand-004",
                    "name": "Rahul Verma",
                    "match_pct": 78.0,
                    "top_gaps": ["deep learning", "natural language processing"],
                    "status": "on_track",
                    "progress_pct": 55.0,
                    "predicted_days_to_competency": 20,
                    "analysis_id": str(uuid.uuid4()),
                },
                {
                    "candidate_id": "demo-cand-005",
                    "name": "Anjali Patel",
                    "match_pct": 88.5,
                    "top_gaps": ["amazon web services"],
                    "status": "on_track",
                    "progress_pct": 80.0,
                    "predicted_days_to_competency": 8,
                    "analysis_id": str(uuid.uuid4()),
                },
            ],
        },
    }

    with open("hr_data.json", "w") as f:
        json.dump(data, f, indent=2)

    print("Demo data seeded successfully!")
    print(f"\nRoles created: {len(data['roles'])}")
    for role_id, role in data["roles"].items():
        cands = data["candidates"].get(role_id, [])
        print(f"  {role['role_title']} — {len(cands)} candidates")
        print(f"    Candidate link: /candidate?role_id={role_id}")

if __name__ == "__main__":
    seed()