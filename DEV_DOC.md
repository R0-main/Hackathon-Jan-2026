# Documentation Technique

## Stack

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Backend | FastAPI + Python | 3.12 |
| Frontend | React + Vite + TypeScript | React 19 |
| Database | SQLite (dev) / PostgreSQL (prod) | - |
| Reverse Proxy | Nginx | Alpine |
| SSL | Let's Encrypt (Certbot) | - |

---

## Structure du projet

```
.
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # Point d'entrée FastAPI
│   │   ├── config.py         # Configuration (env vars)
│   │   ├── database.py       # SQLAlchemy async setup
│   │   ├── models.py         # Modèles ORM
│   │   ├── schemas.py        # Schémas Pydantic
│   │   └── routes/
│   │       └── waitlist.py   # Endpoints waitlist
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── api.ts            # Client API
│   │   └── components/
│   │       └── Waitlist.tsx
│   ├── Dockerfile            # Multi-stage build
│   ├── nginx.conf            # Config nginx interne
│   └── package.json
├── docker-compose.yaml
├── nginx.conf                # Reverse proxy principal
├── Makefile
├── .env.example
└── .gitignore
```

---

## Architecture Docker

```
┌─────────────────────────────────────────────────────┐
│                    Internet                         │
└─────────────────────┬───────────────────────────────┘
                      │ :80/:443
┌─────────────────────▼───────────────────────────────┐
│                    nginx                            │
│              (reverse proxy)                        │
└────────┬────────────────────────────┬───────────────┘
         │ /api/*                     │ /*
┌────────▼────────┐          ┌────────▼────────┐
│     backend     │          │    frontend     │
│   FastAPI:8000  │          │  nginx:3000     │
└────────┬────────┘          │  (static build) │
         │                   └─────────────────┘
┌────────▼────────┐
│   SQLite/PG     │
│   (volume)      │
└─────────────────┘
```

**Services:**
- `nginx` : Reverse proxy, SSL termination, routing
- `backend` : API FastAPI (expose 8000, non public)
- `frontend` : Build React statique servi par nginx interne (expose 3000, non public)
- `certbot` : Renouvellement SSL automatique

---

## API Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Health check API |
| GET | `/health` | Status check |
| POST | `/api/waitlist/` | Inscription waitlist |
| GET | `/api/waitlist/count` | Nombre d'inscrits |

**Exemple POST /api/waitlist/**
```json
// Request
{ "email": "user@example.com" }

// Response 200
{ "message": "Successfully joined the waitlist!", "position": 42 }

// Response 400
{ "detail": "Email already registered" }
```

---

## Configuration

**Variables d'environnement (.env)**

```bash
# Backend
DATABASE_URL=sqlite+aiosqlite:///./data/app.db
CORS_ORIGINS=http://localhost,https://yourdomain.com

# Frontend (build time)
VITE_API_URL=http://localhost/api
```

---

## Commandes

### Production (Docker)

```bash
make              # Build + run
make build        # Build only
make down         # Stop
make restart      # Restart
make logs         # Tous les logs
make logs backend # Logs d'un service
make clean        # Stop + supprime volumes/images
make re           # Clean + rebuild
```

### SSL

```bash
make ssl DOMAIN=example.com EMAIL=admin@example.com
```

### Dev local (sans Docker)

```bash
# Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload    # http://localhost:8000

# Frontend
cd frontend
npm install
npm run dev                       # http://localhost:5173
```

---

## Déploiement VPS

```bash
# 1. Installer Docker + Docker Compose sur le VPS

# 2. Clone
git clone git@github.com:AdelFC/Hackathon-Janvier2026.git
cd Hackathon-Janvier2026

# 3. Configurer
cp .env.example .env
nano .env  # Adapter CORS_ORIGINS et VITE_API_URL

# 4. Lancer
make

# 5. (Optionnel) HTTPS
make ssl DOMAIN=votredomaine.com EMAIL=votre@email.com
# Puis décommenter la config SSL dans nginx.conf
```

---

## Base de données

**Modèle WaitlistEntry**

| Champ | Type | Contraintes |
|-------|------|-------------|
| id | Integer | PK, auto-increment |
| email | String | Unique, indexed |
| created_at | DateTime | Default: now() |

La DB est créée automatiquement au démarrage (`init_db()` dans le lifespan).

Pour passer en PostgreSQL :
```bash
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
```

---

## Ajout de nouvelles routes

1. Créer le fichier dans `backend/app/routes/`
2. Définir le router avec `APIRouter(prefix="/xxx", tags=["xxx"])`
3. Importer et inclure dans `main.py` :
```python
from app.routes import xxx
app.include_router(xxx.router, prefix="/api")
```
