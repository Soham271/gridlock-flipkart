# ASTRAM Gridlock — Bengaluru Traffic Congestion Prediction

**Theme:** Event-Driven Congestion (Planned & Unplanned)
**Deadline:** 21 June 2026

## Architecture

```
Next.js 15 Frontend (:3000)
        ↓  POST /api/predict
Go + Gin Backend (:8080)
        ↓  POST /infer (internal)
Python FastAPI ML Sidecar (:8001)
        ↓  LightGBM + XGBoost + MLP + TabNet → meta-learner
        ↑  severity, confidence, probabilities, resource recommendations
```

## Prerequisites

- **Go** 1.21+
- **Python** 3.10+ (with pip)
- **Node.js** 18+
- ML model files (`.pkl`) in `ml_sidecar/astram_models_bundle/`

## Quick Start (3 terminals)

### Terminal 1 — Python ML Sidecar

```bash
cd ml_sidecar
pip install -r requirements.txt
py -m uvicorn main:app --port 8001 --reload
```

Runs on http://localhost:8001

### Terminal 2 — Go Backend

```bash
cd backend
go run main.go
```

Runs on http://localhost:8080

### Terminal 3 — Next.js Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on http://localhost:3000

## Environment Variables

### Go Backend (`backend/`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | Port for Go server |
| `SIDECAR_URL` | `http://localhost:8001` | URL of Python sidecar |

### Next.js Frontend (`frontend/`)

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Required Model Files

Place these in `ml_sidecar/astram_models_bundle/`:

```
lgbm_model.pkl
xgb_model.pkl
mlp_model.pkl
meta_learner.pkl
scaler.pkl
label_encoders.pkl
kmeans_model.pkl
feature_names.pkl
tabnet_model.zip
```

> These are excluded from git (large binary files). Download from the training notebook or Google Drive.

## API Endpoints

### Go Backend (public)

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/predict` | Predict congestion severity |
| GET | `/api/meta` | Get corridors, zones, police stations |

### POST /api/predict — Request Body

```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "event_type": "planned",
  "event_cause": "Concert",
  "start_hour": 20,
  "day_of_week": 5,
  "month": 6,
  "day": 18,
  "corridor": "MG Road",
  "duration_mins": 180
}
```

### POST /api/predict — Response

```json
{
  "severity_level": 3,
  "severity_label": "Critical",
  "confidence": 0.87,
  "class_probabilities": {
    "Low": 0.02,
    "Medium": 0.05,
    "High": 0.06,
    "Critical": 0.87
  },
  "recommendations": {
    "manpower_min": 15,
    "manpower_max": 25,
    "barricading": "Full perimeter barricading required",
    "diversion": "Mandatory diversion via Hosur Road",
    "impact_minutes": 90,
    "pre_deploy": "Deploy 2 hours before event start"
  },
  "location_cluster": 7
}
```

## Project Structure

```
gridlock-new/
├── backend/                  # Go + Gin API server
│   ├── main.go
│   ├── handlers/
│   │   ├── predict.go
│   │   └── health.go
│   ├── services/
│   │   └── inference.go      # Calls Python sidecar
│   └── models/
│       └── types.go
├── ml_sidecar/               # Python FastAPI ML inference
│   ├── main.py
│   ├── predictor.py
│   ├── loader.py
│   ├── config.py
│   ├── requirements.txt
│   └── astram_models_bundle/ # .pkl files (not in git)
├── frontend/                 # Next.js 15 App Router
│   ├── app/
│   │   ├── page.tsx          # Dashboard
│   │   ├── predict/page.tsx  # Prediction form
│   │   └── history/page.tsx  # History table
│   ├── components/
│   │   ├── map/BengaluruMap.tsx
│   │   ├── prediction/
│   │   └── shared/
│   └── lib/
│       ├── api.ts
│       ├── history.ts
│       └── severity.ts
└── ROADMAP.md
```

## Deployment

### Railway (Go + Python)

1. Connect GitHub repo to Railway
2. Create two services: `backend/` and `ml_sidecar/`
3. Set env vars: `SIDECAR_URL=http://<sidecar-service>.railway.internal:8001`
4. Upload `.pkl` files as Railway volumes or use a shared drive URL at startup

### Vercel (Next.js)

1. Connect GitHub repo to Vercel, set root to `frontend/`
2. Set env var: `NEXT_PUBLIC_API_URL=https://<your-railway-go-url>`

## ML Models

| Model | Role |
|---|---|
| LightGBM | Base learner (best single model) |
| XGBoost | Base learner |
| MLP (sklearn) | Base learner |
| TabNet | Base learner (optional) |
| Meta-learner | Stacks base model probabilities → final prediction |
| KMeans (20 clusters) | Geo-cluster assignment for Bengaluru |

**Severity Classes:** 0=Low, 1=Medium, 2=High, 3=Critical
