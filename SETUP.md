# GAPLYTICS — Setup Guide

Everything you need to run Gaplytics locally from scratch.

---

## Prerequisites

| Tool | Version | Check |
|---|---|---|
| Python | 3.11+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | any | `git --version` |

You also need an **AWS Bedrock API key** — see Step 1 below.

---

## Step 1 — Get Your AWS Bedrock Key

1. Sign in to [AWS Console](https://console.aws.amazon.com)
2. Search for **Amazon Bedrock** in the services bar
3. In the left sidebar → **API keys** → **Generate long-term API key**
4. Copy the key (starts with `ABSKQm...`) — you will need it in Step 3
5. Go to **Bedrock → Model access** → enable **Claude 3 Haiku** (free tier available)

---

## Step 2 — Clone the Repository

```bash
git clone https://github.com/balapraharsha/Gaplytics.git
cd Gaplytics
```

---

## Step 3 — Backend Setup

```bash
cd backend
```

Create your environment file:

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
AWS_BEARER_TOKEN_BEDROCK=your_key_here
AWS_REGION=us-east-1
BEDROCK_MODEL=anthropic.claude-3-haiku-20240307-v1:0
FRONTEND_URL=http://localhost:5173
SEMANTIC_THRESHOLD=0.75
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the server:

```bash
uvicorn main:app --reload --port 8000
```

Verify it is working — open this in your browser:

```
http://localhost:8000/api/health
```

Expected response:

```json
{"status": "ok", "version": "5.0.0", "ai": "AWS Bedrock (Claude 3 Haiku)", "configured": true}
```

If `"configured": false` — your `AWS_BEARER_TOKEN_BEDROCK` is missing or wrong.

---

## Step 4 — Frontend Setup

Open a new terminal tab, then:

```bash
cd frontend
cp .env.example .env
```

The default `.env` already points to your local backend — no changes needed:

```env
VITE_API_URL=http://localhost:8000
```

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open your browser at:

```
http://localhost:5173
```

---

## Step 5 — Test the Full Flow

**As a Candidate:**
1. Click **New Hire → Start My Journey**
2. Upload a PDF resume (text-based, not scanned)
3. Paste a job description into the text area
4. Set a deadline 30–90 days out
5. Click **Analyze My Path**
6. You should see your skill gap dashboard, roadmap, and investment tracker

**As HR:**
1. Click **HR Portal**
2. Create a new role by pasting a job description
3. Copy the candidate share link
4. Open the link as a candidate and complete an analysis
5. Return to the HR portal to see the candidate in the pipeline

---

## Common Issues

**"Analysis failed. Please try again"**
- Backend is not running — start it with `uvicorn main:app --reload --port 8000`
- Or `VITE_API_URL` in `frontend/.env` is wrong — should be `http://localhost:8000`

**"configured: false" in health check**
- `AWS_BEARER_TOKEN_BEDROCK` is missing from `backend/.env`
- Make sure there are no spaces around the `=` sign

**"No skills found in resume"**
- Your PDF is scanned (image-based) — PyMuPDF cannot extract text from images
- Use a text-based PDF instead

**CORS error in browser console**
- Backend is not running on port 8000
- Or you forgot to start the backend before the frontend

**Model 403 from Bedrock**
- Claude 3 Haiku is not enabled in your AWS account
- Go to AWS Console → Bedrock → Model access → Enable Claude 3 Haiku

**Port already in use**
```bash
# Change the backend port
uvicorn main:app --reload --port 8001

# Update frontend .env to match
VITE_API_URL=http://localhost:8001
```

---

## Docker (Optional)

Run the backend in a container instead of installing Python locally:

```bash
cd backend
docker build -t gaplytics-backend .
docker run -p 8000:8000 --env-file .env gaplytics-backend
```

Then run the frontend normally with `npm run dev`.

---

## Production Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build   # verify build succeeds locally first
```

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select `balapraharsha/Gaplytics`
3. Set **Root Directory** to `frontend`
4. Add environment variable: `VITE_API_URL` = your Render backend URL
5. Click Deploy

Every push to `main` auto-redeploys.

### Backend → Render

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect `balapraharsha/Gaplytics`
3. Set **Root Directory** to `backend`
4. **Build Command:** `pip install -r requirements.txt`
5. **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables (same as your local `.env`)
7. Click Deploy

**Note:** Free tier Render services sleep after 15 minutes of inactivity. The first request after sleep takes 30–60 seconds. Visit `/api/health` before a demo to wake it up.

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `AWS_BEARER_TOKEN_BEDROCK` | Yes | — | AWS Bedrock long-term API key |
| `AWS_REGION` | No | `us-east-1` | AWS region for Bedrock |
| `BEDROCK_MODEL` | No | `anthropic.claude-3-haiku-20240307-v1:0` | Primary model |
| `FRONTEND_URL` | No | `http://localhost:5173` | CORS allowed origin |
| `SEMANTIC_THRESHOLD` | No | `0.75` | Skill matching sensitivity (0.0–1.0) |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | Yes | `http://localhost:8000` | Backend API base URL |
