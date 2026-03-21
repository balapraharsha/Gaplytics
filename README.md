# GAPLYTICS — AI-Adaptive Onboarding Engine
> "Close the Gap. Own the Role."

A dual-role AI onboarding platform. HR posts roles, candidates upload resumes — AI computes skill gaps, builds day-by-day roadmaps, and runs score-gated mock interviews.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS + Framer Motion + @xyflow/react |
| Backend | FastAPI + PyMuPDF + Python 3.11 |
| AI | AWS Bedrock (Claude 3 Haiku) via Bearer token — no boto3 |
| Deployment | Vercel (frontend) · Render (backend) · Docker ready |

---

## Setup

### Backend

```bash
cd backend
cp .env.example .env
# Add your AWS_BEARER_TOKEN_BEDROCK to .env
pip install -r requirements.txt
uvicorn main:app --reload
# Runs on http://localhost:8000
```

Get your AWS Bedrock key:
1. Go to [AWS Console → Amazon Bedrock → API keys](https://console.aws.amazon.com/bedrock)
2. Click **Generate long-term API key**
3. Copy the key into `backend/.env`

### Frontend

```bash
cd frontend
cp .env.example .env
# Edit VITE_API_URL if backend runs on a different port
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## Project Structure

```
gaplytics/
├── backend/
│   ├── main.py              FastAPI app — all routes
│   ├── ai_client.py         AWS Bedrock client (no boto3, pure urllib)
│   ├── adaptive.py          Graph-based DAG pathing + Kahn sort + scheduler
│   ├── chat.py              AI Coach response generation
│   ├── course_catalog.py    50+ hardcoded modules with real resource URLs
│   ├── hr_store.py          In-memory + JSON file HR persistence
│   ├── interview.py         12-question generation + 9-dimension evaluation
│   ├── models.py            All Pydantic v2 models
│   ├── parser.py            PDF extraction (PyMuPDF) + skill extraction
│   ├── skill_gap.py         Weighted gap scoring + 3-stage matching
│   ├── Dockerfile
│   ├── render.yaml
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ChatCoach.jsx
    │   │   ├── InteractiveFeedback.jsx
    │   │   ├── LeafBackground.jsx
    │   │   └── ReasoningTrace.jsx
    │   ├── pages/
    │   │   ├── Landing.jsx
    │   │   ├── hr/
    │   │   │   ├── HRDashboard.jsx
    │   │   │   ├── RoleDetail.jsx
    │   │   │   └── CompareView.jsx
    │   │   └── candidate/
    │   │       ├── CandidateUpload.jsx
    │   │       ├── Dashboard.jsx
    │   │       ├── DeadlineRoadmap.jsx
    │   │       ├── AuthorizedInterview.jsx
    │   │       ├── MockInterview.jsx
    │   │       └── InterviewResults.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.js
    └── vercel.json
```

---

## Architecture

```
HR ──→ [Create Role] ──→ [JD Analysis] ──→ [Candidate Pipeline]
                                                    │
Candidate ──→ [Resume Upload] ──→ [Skill Gap] ──→ [Daily Roadmap]
                                                    │
                                            [Score >= 90?]
                                             Yes         No
                                      [Mock Interview] [Feedback]
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/analyze` | Full resume + JD analysis |
| POST | `/api/chat` | AI coach response |
| POST | `/api/interview/generate` | Generate 12 questions |
| POST | `/api/interview/evaluate` | 9-dimension evaluation |
| POST | `/api/hr/create-role` | Create HR role from JD |
| GET | `/api/hr/roles` | List all roles |
| GET | `/api/hr/role/{id}` | Role detail + candidates |
| GET | `/api/hr/candidates/{id}` | Candidate list for role |
| POST | `/api/hr/compare` | AI candidate comparison |
| GET | `/api/health` | Health check |

---

## Deployment

**Frontend → Vercel**
```bash
cd frontend && npm run build
# vercel.json is already configured
```

**Backend → Render**
```bash
# render.yaml is already configured
# Set AWS_BEARER_TOKEN_BEDROCK in Render environment variables
```

**Backend → Docker**
```bash
cd backend
docker build -t gaplytics-backend .
docker run -p 8000:8000 --env-file .env gaplytics-backend
```

---

## Deep Maritime Palette

| Token | Hex | Use |
|---|---|---|
| Chinese Black | `#0C1519` | Page background |
| Dark Jungle Green | `#162127` | Cards, panels |
| Jet | `#3A3534` | Borders, dividers |
| Coffee | `#724B39` | Warm accent, hover |
| Antique Brass | `#CF9D7B` | CTAs, headings, active |
