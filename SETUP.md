# Quick Setup Guide

## 1. Get your AWS Bedrock API Key

1. Sign in to [AWS Console](https://console.aws.amazon.com)
2. Navigate to **Amazon Bedrock** → **API keys**
3. Click **Generate long-term API key**
4. Copy the key (starts with `ABSKQm...`)

## 2. Backend

```bash
cd backend

# Create .env from example
cp .env.example .env

# Open .env and replace the placeholder:
# AWS_BEARER_TOKEN_BEDROCK=your_actual_key_here

# Install dependencies (Python 3.11+ required)
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

Visit http://localhost:8000/api/health — you should see `{"status":"ok"}`

## 3. Frontend

```bash
cd frontend

# Create .env from example
cp .env.example .env
# VITE_API_URL=http://localhost:8000  ← default, no change needed

# Install dependencies (Node 18+ required)
npm install

# Start the dev server
npm run dev
```

Visit http://localhost:5173

## 4. Test the flow

1. Open http://localhost:5173
2. Click **New Hire → Start My Journey**
3. Upload a PDF resume
4. Paste a job description
5. Set a deadline 30+ days out
6. Click **Analyze My Path**

---

## Common Issues

**"AWS_BEARER_TOKEN_BEDROCK not set"**
→ Check your `backend/.env` file has the key on one line with no spaces.

**CORS error in browser**
→ Make sure backend is running on port 8000 and `VITE_API_URL` matches.

**PDF not reading**
→ Ensure the PDF is text-based (not a scanned image). The backend uses PyMuPDF.

**"No skills found in resume"**
→ Try a different PDF — some PDFs have text encoding issues. Plain text PDFs work best.
