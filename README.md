<div align="center">

# 🎯 Gaplytics
### AI-Adaptive Onboarding Engine

**Close the Gap. Own the Role.**

![Version](https://img.shields.io/badge/version-5.0-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688?logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![AWS Bedrock](https://img.shields.io/badge/AWS%20Bedrock-Claude%203%20Haiku-FF9900?logo=amazonaws)

[🚀 Live App](https://gaplytics.vercel.app) · [📦 Repository](https://github.com/balapraharsha/Gaplytics) · [📖 API Docs](https://gaplytics-backend.onrender.com/docs)

</div>

---

## 📌 Project Overview

**Gaplytics** is a dual-role AI-powered onboarding engine that bridges the gap between what candidates know and what roles require. It combines PDF resume extraction, AI skill analysis, graph-based learning pathway generation, and score-gated mock technical interviews into a single cohesive platform.

### 👥 Two Primary Users

**HR Managers / Hiring Teams**
- Post job descriptions and generate shareable candidate links
- View the full candidate pipeline with match scores
- Compare candidates side-by-side using AI verdicts
- Track team readiness in real time

**New Hires / Candidates**
- Upload a PDF resume and receive a precise skill gap analysis against the job description
- Follow a day-by-day personalized learning roadmap
- Chat with an AI coach
- Unlock a 12-question mock technical interview upon achieving a **90%+ match score**

> *"The only onboarding platform that builds a personalized training path for every hire, from day one to full competency."*

### 🌐 Live Deployment

| Service | URL |
|---------|-----|
| **Frontend** | https://gaplytics.vercel.app |
| **Backend** | https://gaplytics-backend.onrender.com |
| **Repository** | https://github.com/balapraharsha/Gaplytics |

---

## 🏗️ Architecture & System Design

The system is split into two independently deployed services connected via REST API. All AI calls route through AWS Bedrock using Bearer token authentication — no AWS SDK or boto3 dependency required.

### High-Level Data Flow

```
HR Portal                           Candidate Portal
──────────────────────────          ──────────────────────────────────
1. POST /api/hr/create-role    →    1. Upload resume PDF
   JD text / PDF uploaded           2. POST /api/analyze
   Claude extracts requirements      3. PyMuPDF → raw text extraction
   role_id UUID generated            4. Claude → skill array (JSON)
2. GET /api/hr/role/{id}             5. Weighted gap scoring
   Candidate pipeline view           6. Kahn topological sort (DAG)
3. POST /api/hr/compare              7. Deadline bin-packing scheduler
   AI-generated verdict              8. Score gate: ≥90% → interview
```

### Service Architecture

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite + TailwindCSS | SPA — all candidate and HR UI |
| **Backend** | FastAPI + Python 3.11 + Uvicorn | REST API — all business logic |
| **AI / LLM** | AWS Bedrock (Claude 3 Haiku) | Extraction, coaching, interview gen/eval |
| **PDF Parsing** | PyMuPDF (fitz) | Resume and JD text extraction |
| **Animations** | Framer Motion | Physics-based UI transitions |
| **Graph View** | @xyflow/react | Interactive DAG roadmap visualization |
| **Charts** | Recharts | 9-axis radar chart for interview results |
| **Persistence (HR)** | JSON file (`hr_data.json`) | Roles and candidates persist across restarts |
| **Persistence (Candidate)** | Browser localStorage | Roadmap progress, analysis cache |
| **Deployment (FE)** | Vercel | Auto-deploys from GitHub main branch |
| **Deployment (BE)** | Render.com | Python web service with env var secrets |

---

## 📦 Dependencies

### Backend

Python 3.11+ required. Install with:

```bash
pip install -r requirements.txt
```

| Package | Version | Purpose |
|---------|---------|---------|
| `fastapi` | ≥0.110.0 | REST API framework |
| `uvicorn[standard]` | ≥0.27.0 | ASGI production server |
| `python-multipart` | ≥0.0.9 | Multipart form data (file uploads) |
| `pymupdf` | ≥1.23.0 | PDF text extraction (fitz module) |
| `python-dotenv` | ≥1.0.0 | Load `.env` environment variables |
| `pydantic` | ≥2.0.0 | Data validation — all request/response models |
| `mangum` | ≥0.17.0 | AWS Lambda handler (optional serverless deploy) |

> **ℹ️ No boto3 Required** — The AWS Bedrock client (`ai_client.py`) uses Python's built-in `urllib` for HTTP requests. Authentication uses a long-term Bearer token — no AWS CLI setup, no IAM roles, no SDK.

### Frontend

Node 18+ required. Install with:

```bash
cd frontend && npm install
```

| Package | Purpose |
|---------|---------|
| `react@18`, `react-dom@18` | Core UI framework |
| `react-router-dom@6` | SPA routing — 9 routes |
| `vite@5` | Build tool and dev server |
| `tailwindcss@3` | Utility-first CSS framework |
| `framer-motion` | Animation library (physics spring, stagger, page transitions) |
| `@xyflow/react` | Interactive node graph for DAG roadmap view |
| `recharts` | RadarChart for 9-dimension interview results |
| `react-hot-toast` | Toast notifications |
| `axios` | HTTP client for all API calls |
| `react-dropzone` | PDF drag-and-drop upload zones |
| `highlight.js` | Code syntax highlighting in interview questions |

---

## 🚀 Setup Instructions

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- An AWS Bedrock long-term API key (AWS Console → Bedrock → API keys)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/balapraharsha/Gaplytics.git
cd Gaplytics
```

### 2. Backend Setup

```bash
cd backend

# Create environment file
cp .env.example .env
```

Open `.env` and add your credentials:

```env
AWS_BEARER_TOKEN_BEDROCK=ABSKQm...your_key_here...
AWS_REGION=us-east-1
BEDROCK_MODEL=anthropic.claude-3-haiku-20240307-v1:0
FRONTEND_URL=http://localhost:5173
SEMANTIC_THRESHOLD=0.75
```

```bash
# Install dependencies
pip install -r requirements.txt

# Start the development server
uvicorn main:app --reload --port 8000
```

Verify it's running:

```bash
curl http://localhost:8000/api/health
# Expected: {"status":"ok","version":"5.0.0","ai":"AWS Bedrock (Claude 3 Haiku)","configured":true}
```

### 3. Frontend Setup

```bash
cd frontend

# Create environment file
cp .env.example .env
# Default .env points to local backend — no changes needed for local dev
# VITE_API_URL=http://localhost:8000

npm install
npm run dev
# Open http://localhost:5173
```

### 4. Getting Your AWS Bedrock API Key

1. Sign in to [AWS Management Console](https://console.aws.amazon.com)
2. Navigate to **Amazon Bedrock** via the services search bar
3. In the left sidebar, click **API keys**
4. Click **Generate long-term API key**
5. Copy the key (starts with `ABSKQm...`) and paste it into `backend/.env`
6. Enable model access: AWS Console → Bedrock → Model access → **Enable Claude 3 Haiku**

> **🔄 Fallback Chain** — If Claude 3 Haiku returns a 403 or 404, the system automatically tries: `Claude 3.5 Haiku → Amazon Titan Text Lite`. The app never hard-crashes due to a single model being unavailable.

### 5. Docker Deployment (Backend)

```bash
cd backend
docker build -t gaplytics-backend .
docker run -p 8000:8000 --env-file .env gaplytics-backend
```

### 6. Production Deployment

**Frontend → Vercel**

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Set **Root Directory**: `frontend`
4. Add Environment Variable: `VITE_API_URL` = your Render backend URL
5. Click **Deploy** — Vercel auto-deploys on every push to `main`

**Backend → Render**

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Set **Root Directory**: `backend`
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add all environment variables from `.env.example`
7. Click **Deploy**

---

## 🧠 Skill-Gap Analysis: Logic Overview

The skill-gap engine transforms two unstructured text inputs — a resume PDF and a job description — into a precise numerical gap score, a prioritised list of missing skills, and a weighted overall match percentage. Implemented in `parser.py`, `skill_gap.py`, and `adaptive.py`.

### Stage 1 — Text Extraction

```python
# parser.py
def extract_text_from_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype='pdf')
    return '\n'.join(page.get_text() for page in doc)
```

Extracted text is capped at 8,000 characters before being sent to the AI model.

### Stage 2 — AI Skill Extraction

Two separate structured prompts are sent to AWS Bedrock (Claude 3 Haiku), one for the resume and one for the JD:

```json
// Resume extraction returns:
[{
  "name": "python",
  "category": "programming_language",
  "proficiency_level": 7,
  "years_experience": 3.0,
  "evidence": "Built REST APIs with FastAPI and Python 3.11"
}]

// JD extraction returns:
[{
  "name": "python",
  "category": "programming_language",
  "required_level": 9,
  "is_mandatory": true,
  "context": "Strong Python 3 skills required",
  "job_market_relevance_pct": 82
}]
```

Both arrays are validated against Pydantic v2 models (`ResumeSkill` and `JDRequirement`) before any matching occurs.

### Stage 3 — Skill Name Normalisation

All skill names pass through `normalize_skill_name()` which lowercases, strips whitespace, and resolves a hand-curated alias map:

```python
ALIAS = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'k8s': 'kubernetes',
    'ml': 'machine learning',
    'ci/cd': 'ci cd',
    'aws': 'amazon web services',
    'node': 'node.js',
    'reactjs': 'react',
    'springboot': 'spring boot',
    # ...20 more aliases
}
```

### Stage 4 — Three-Stage Matching

| Stage | Method | Threshold | Example Match |
|-------|--------|-----------|---------------|
| **1 — Exact / Alias** | `normalize_skill_name()` equality | score = 1.0 | `js → javascript` ✓ |
| **2 — Substring** | One name contains the other | score = 0.85 | `python 3 → python` ✓ |
| **3 — Word Overlap** | Shared word ratio ≥ 50% | score ≥ 0.50 | `machine learning eng → machine learning` ✓ |

If no match is found, the skill is treated as fully absent (`candidate_level = 0`). The semantic threshold is configurable via the `SEMANTIC_THRESHOLD` environment variable.

### Stage 5 — Gap Score Computation

```python
gap_score = required_level - candidate_level  # Both on a 1-10 scale

# Priority classification:
if is_mandatory and gap_score >= 5: priority = 'critical'
elif gap_score >= 3:                priority = 'high'
elif gap_score >= 1:                priority = 'medium'
else:                               priority = 'low'
```

Critical gaps appear first in the candidate dashboard and drive the rejection reason predictor. The top three critical/high gaps are surfaced as "likely rejection factors" with `job_market_relevance_pct` percentages sourced from the O\*NET 30.2 database.

### Stage 6 — Weighted Overall Match Score

Mandatory skills carry 2× weight to reflect real-world hiring criteria:

```python
total_weight = sum(2 if r.is_mandatory else 1 for r in jd_requirements)
matched_weight = 0

for req in jd_requirements:
    candidate_level = find_candidate_level(req, resume_skills)
    match_pct = min(100, (candidate_level / req.required_level) * 100)
    weight = 2 if req.is_mandatory else 1
    matched_weight += (match_pct / 100) * weight

overall_match = round((matched_weight / total_weight) * 100, 1)
```

> **🔒 Score Gate Logic**
> - `overall_match >= 90` → `score_gate = 'mock_interview'` — interview unlocks
> - `overall_match < 90` → `score_gate = 'feedback'` — InteractiveFeedback shown
>
> The mock interview route (`/candidate/interview`) redirects to the dashboard if the stored score is below 90%. This gate is enforced at the route level in `AuthorizedInterview.jsx` — it is never just hidden, it is genuinely absent from the DOM.

### Stage 7 — Adaptive Learning Pathway

The gap result feeds directly into the adaptive learning pathway generator (`adaptive.py`), which runs four original algorithms in sequence:

| Algorithm | Description |
|-----------|-------------|
| **1. Graph-Based Prerequisite DAG** | Builds a directed acyclic graph from the 50+ module catalog. Each `CourseModule` has a `prerequisites[]` array. Transitive prerequisites are recursively expanded. |
| **2. Kahn's Topological Sort (BFS)** | Processes the DAG using in-degree tracking. Detects cycles with `len(sorted) < len(graph)`. Produces a valid linear module order from foundational to advanced skills. |
| **3. Deadline-Aware Bin-Packing Scheduler** | Packs modules into day slots respecting the `daily_hours` budget. If `required_daily > budget`, the system auto-adjusts (×1.1 ceiling, rounded to nearest 0.5h) and shows a warning toast. The last two days are always reserved: `final_review` then `mock_test`. |
| **4. Priority-Weighted Gap Scoring** | Critical path modules — those addressing mandatory skills — are scheduled in the first 60% of days. Review and rest days fill the remaining slots on a repeating pattern. |

---

## 📡 API Reference

Full OpenAPI documentation is auto-generated at [`/docs`](https://gaplytics-backend.onrender.com/docs) (Swagger UI) and [`/redoc`](https://gaplytics-backend.onrender.com/redoc).

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check — returns version, model, and configured status |
| `GET` | `/api/ping` | Live AI ping — calls Bedrock and returns `GAPLYTICS_OK` |
| `POST` | `/api/analyze` | Core analysis — resume PDF + JD → full gap result + pathway |
| `POST` | `/api/chat` | AI coach — context-aware response from Claude |
| `POST` | `/api/interview/generate` | Generate 12 interview questions across 6 types |
| `POST` | `/api/interview/evaluate` | Evaluate answers across 9 dimensions |
| `POST` | `/api/interview/feedback` | Get feedback on a single practice answer |
| `POST` | `/api/hr/create-role` | Create HR role from JD — returns `role_id` + candidate URL |
| `GET` | `/api/hr/roles` | List all HR roles |
| `GET` | `/api/hr/role/{role_id}` | Role detail + full candidate pipeline |
| `GET` | `/api/hr/candidates/{role_id}` | Candidate summaries for a role |
| `POST` | `/api/hr/compare` | AI side-by-side candidate comparison |

---

## 📊 Datasets & Citations

- **O\*NET 30.2 Database** — Powers the `ONET_RELEVANCE` dict across all 50 course modules. [Source](https://www.onetcenter.org/db_releases.html)
- **Kaggle Resume Dataset** — Parser validation and test fixtures. [Source](https://www.kaggle.com/datasets/snehaanbhawal/resume-dataset)
- **Kaggle Jobs & JD Dataset** — JD extraction validation across 5 domains. [Source](https://www.kaggle.com/datasets/kshitizregmi/jobs-and-job-description)

---

## 🔧 Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `AWS_BEARER_TOKEN_BEDROCK not set` | Missing `.env` key | Add your token to `backend/.env` |
| `No skills found in resume` | Scanned/image PDF | Use a text-based PDF. PyMuPDF cannot OCR images. |
| `CORS error in browser` | Backend not running | Ensure uvicorn is on port 8000 and `VITE_API_URL` matches |
| `JSON parse failed after repair` | LLM response truncated | Increase `max_tokens` in the relevant `ai_client.py` call |
| `Deadline must be future date` | Date validation failed | Set deadline at least 1 day after today (backend enforces this) |
| `Model 403 on Bedrock` | Model access not enabled | AWS Console → Bedrock → Model access → Enable Claude 3 Haiku |

---

## 📄 License & Acknowledgements

This project was built for the **Gaplytics Hackathon**. All AI analysis is powered by [AWS Bedrock](https://aws.amazon.com/bedrock/) (Claude 3 Haiku by Anthropic). Skill taxonomy data sourced from O\*NET 30.2 (U.S. Department of Labor). Resume and JD test data from Kaggle public datasets.

---

<div align="center">

**[🌐 Live App](https://gaplytics.vercel.app)** · **[📦 GitHub](https://github.com/balapraharsha/Gaplytics)**

</div>
