# Hackathon ORIGIN Paris 2026

## Stack

- **Backend**: FastAPI + Python 3.12
- **Frontend**: React 19 + Vite + TypeScript
- **Database**: SQLite (dev) / PostgreSQL (prod)

## Setup

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## API Endpoints

- `GET /` - Health check
- `POST /api/waitlist/` - Join waitlist
- `GET /api/waitlist/count` - Get waitlist count
