<div align="center">

# GAPLYTICS
### AI-Adaptive Onboarding Engine

**Close the Gap. Own the Role.**

[![Live App](https://img.shields.io/badge/Live%20App-gaplytics.vercel.app-CF9D7B?style=flat-square)](https://gaplytics.vercel.app)
[![Backend](https://img.shields.io/badge/API-Render-162127?style=flat-square)](https://gaplytics-fuax.onrender.com/api/health)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![AWS Bedrock](https://img.shields.io/badge/AWS%20Bedrock-Claude%203%20Haiku-FF9900?style=flat-square&logo=amazonaws)](https://aws.amazon.com/bedrock)

</div>

---

## What is Gaplytics?

Gaplytics is a dual-role AI onboarding platform. HR teams post job descriptions, candidates upload resumes — the AI engine computes precise skill gaps, builds a personalised day-by-day learning roadmap, and unlocks a score-gated mock technical interview for candidates who reach 90%+ match.

No generic onboarding. No keyword guessing. Every hire gets a path built specifically for them.

---

## Live Deployment

| Service | URL |
|---|---|
| Frontend | https://gaplytics.vercel.app |
| Backend API | https://gaplytics-fuax.onrender.com |
| API Docs | https://gaplytics-fuax.onrender.com/docs |
| Repository | https://github.com/balapraharsha/Gaplytics |

---

## Features

### Candidate Side
- Upload a PDF resume — AI extracts skills with proficiency levels
- Paste or upload a job description — AI extracts role requirements
- Get a precise skill gap analysis with weighted match score
- Follow a day-by-day learning roadmap built around your deadline
- Track investment: hours completed, modules done, pace vs schedule
- Chat with an AI coach that knows your specific gaps
- Score >= 90% unlocks a 12-question mock technical interview
- Score 60-89% unlocks AI Resume Tailor with one-click PDF download
- Visual graph view of your learning pathway by difficulty tier

### HR Side
- Create roles from a job description in seconds
- Share a candidate link — every submission is tracked automatically
- View the full candidate pipeline with match scores, status, and top gaps
- See each candidate's investment tracker: hours in, modules done, pace status
- Compare two candidates side-by-side with an AI verdict
- Team readiness bar across all candidates for the role

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, Framer Motion |
| Graph View | Custom SVG DAG |
| Charts | Recharts (radar chart for interview results) |
| Backend | FastAPI, Python 3.11, Uvicorn |
| PDF Extraction | PyMuPDF (fitz) |
| AI / LLM | AWS Bedrock — Claude 3 Haiku |
| Data Validation | Pydantic v2 |
| HR Persistence | JSON file + in-memory store |
| Candidate State | Browser localStorage |
| Frontend Deploy | Vercel |
| Backend Deploy | Render.com |

---

## Project Structure

```
Gaplytics/
├── backend/
│   ├── main.py              All FastAPI routes
│   ├── ai_client.py         AWS Bedrock client — no boto3, pure urllib
│   ├── adaptive.py          DAG builder + Kahn sort + deadline scheduler
│   ├── skill_gap.py         AI semantic skill matching + weighted gap scoring
│   ├── parser.py            PDF extraction + skill normalisation
│   ├── course_catalog.py    50+ course modules with prerequisites
│   ├── interview.py         12-question generation + 9-dimension evaluation
│   ├── hr_store.py          HR role and candidate persistence
│   ├── models.py            All Pydantic v2 models
│   ├── chat.py              AI coach response generation
│   ├── Dockerfile
│   └── render.yaml
│
└── frontend/
    └── src/
        ├── App.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ChatCoach.jsx
        │   ├── ResumeTailor.jsx
        │   ├── ReasoningTrace.jsx
        │   ├── InteractiveFeedback.jsx
        │   └── LeafBackground.jsx
        └── pages/
            ├── Landing.jsx
            ├── hr/
            │   ├── HRDashboard.jsx
            │   ├── RoleDetail.jsx
            │   ├── CompareView.jsx
            │   └── CandidateProgressView.jsx
            └── candidate/
                ├── CandidateUpload.jsx
                ├── Dashboard.jsx
                ├── DeadlineRoadmap.jsx
                ├── AuthorizedInterview.jsx
                ├── MockInterview.jsx
                └── InterviewResults.jsx
```

---

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- AWS Bedrock long-term API key

**Get your AWS Bedrock key:**
1. Go to [AWS Console](https://console.aws.amazon.com) → Amazon Bedrock → API keys
2. Click **Generate long-term API key**
3. Enable model access: Bedrock → Model access → Enable **Claude 3 Haiku**

---

### Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
AWS_BEARER_TOKEN_BEDROCK=your_key_here
AWS_REGION=us-east-1
BEDROCK_MODEL=anthropic.claude-3-haiku-20240307-v1:0
FRONTEND_URL=http://localhost:5173
SEMANTIC_THRESHOLD=0.75
```

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Verify at: `http://localhost:8000/api/health`

---

### Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:8000  (default, no change needed for local dev)

npm install
npm run dev
```

Open: `http://localhost:5173`

---

### Docker (Backend)

```bash
cd backend
docker build -t gaplytics-backend .
docker run -p 8000:8000 --env-file .env gaplytics-backend
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/analyze` | Full resume + JD analysis |
| POST | `/api/chat` | AI coach response |
| POST | `/api/tailor-resume` | AI resume rewriting |
| POST | `/api/interview/generate` | Generate 12 interview questions |
| POST | `/api/interview/evaluate` | 9-dimension answer evaluation |
| POST | `/api/hr/create-role` | Create HR role from JD |
| GET | `/api/hr/roles` | List all roles |
| GET | `/api/hr/role/{id}` | Role detail + candidate pipeline |
| POST | `/api/hr/compare` | AI candidate comparison |

Full interactive docs at `/docs`.

---

## Skill Gap Analysis — How It Works

The gap engine runs in 6 stages:

1. **PDF extraction** — PyMuPDF pulls raw text from resume and JD (8000 char limit)
2. **AI extraction** — Claude extracts structured skill arrays with proficiency levels (1-10)
3. **Normalisation** — resolves aliases: `js → javascript`, `k8s → kubernetes`, `tf → tensorflow`
4. **Three-stage keyword matching** — exact → substring → word overlap (>=50%)
5. **AI semantic fallback** — for unmatched skills, Claude maps JD requirements to resume skills by meaning: `cloud platforms → AWS`, `end-to-end ML → TensorFlow pipelines`
6. **Weighted scoring** — mandatory skills count 2x. Gap score = `required_level - candidate_level`. Priorities: critical → high → medium → low

---

## Adaptive Pathway — How It Works

Four original algorithms run in sequence:

1. **Graph-Based Prerequisite DAG** — builds a directed acyclic graph from the course catalog. Transitive prerequisites are recursively expanded.
2. **Kahn's Topological Sort (BFS)** — processes the DAG with in-degree tracking to produce a valid linear learning order. Detects cycles.
3. **Deadline-Aware Bin-Packing** — packs modules into day slots within the `daily_hours` budget. Last 2 days reserved for final review and mock test.
4. **Priority Scheduling** — critical and high-priority gap modules are scheduled in the first 60% of days.

---

## Datasets Used

| Dataset | Source | Usage |
|---|---|---|
| O*NET 30.2 Database | [onetcenter.org](https://www.onetcenter.org/db_releases.html) | Job market relevance % for all modules |
| Kaggle Resume Dataset | [kaggle.com](https://www.kaggle.com/datasets/snehaanbhawal/resume-dataset) | Parser validation and test fixtures |
| Kaggle Jobs & JD Dataset | [kaggle.com](https://www.kaggle.com/datasets/kshitizregmi/jobs-and-job-description) | JD extraction validation across 5 domains |

---

## Deployment

### Frontend → Vercel

1. Push to GitHub
2. Vercel → New Project → Import `balapraharsha/Gaplytics`
3. Root Directory: `frontend`
4. Env var: `VITE_API_URL=https://gaplytics-fuax.onrender.com`
5. Deploy — auto-redeploys on every push to `main`

### Backend → Render

1. Render → New → Web Service → Connect GitHub repo
2. Root Directory: `backend`
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add all env vars from `.env.example`

---

## Troubleshooting

| Error | Fix |
|---|---|
| `Analysis failed` | Check `VITE_API_URL` in Vercel points to Render, not localhost |
| Backend not responding | Visit `/api/health` to wake it up — free tier sleeps after 15 min |
| `AWS_BEARER_TOKEN_BEDROCK not set` | Add the key to `backend/.env` or Render env vars |
| `No skills found in resume` | Use a text-based PDF — PyMuPDF cannot OCR scanned images |
| `Invalid JSON from Bedrock` | Transient — retry. Max tokens set to 6000 to minimise this |
| Model 403 on Bedrock | AWS Console → Bedrock → Model access → Enable Claude 3 Haiku |

---

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| Chinese Black | `#0C1519` | Page background |
| Dark Jungle Green | `#162127` | Cards, panels |
| Jet | `#3A3534` | Borders, dividers |
| Coffee | `#724B39` | Warm accent, hover states |
| Antique Brass | `#CF9D7B` | CTAs, headings, active states |

---

<div align="center">
Built for the Gaplytics Hackathon &nbsp;·&nbsp; Powered by AWS Bedrock (Claude 3 Haiku by Anthropic)
</div>
