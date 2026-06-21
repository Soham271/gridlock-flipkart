# 🚦 ASTRAM Gridlock — Bengaluru Traffic Congestion Prediction

> **Predict. Prepare. Prevent.** — An AI-powered system to forecast event-driven traffic congestion and generate real-time resource allocation recommendations for Bengaluru's traffic management authorities.

[![Go](https://img.shields.io/badge/Backend-Go%201.21+-00ADD8?logo=go&logoColor=white)](https://go.dev)
[![Python](https://img.shields.io/badge/ML%20Sidecar-Python%203.10+-3776AB?logo=python&logoColor=white)](https://python.org)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)

---

## 🌟 What is ASTRAM Gridlock?

ASTRAM Gridlock is a full-stack predictive AI application built for the **Flipkart Grid 6.0 Hackathon**. It addresses the real-world challenge of **event-driven traffic congestion** in Bengaluru — both planned events (concerts, rallies, marathons) and unplanned incidents.

Given an event's location, type, timing, and duration, the system:
- Predicts **traffic severity level** (Low / Medium / High / Critical)
- Provides a **confidence score** with class probabilities
- Recommends **manpower, barricading, and diversion strategies**
- Identifies the **geo-cluster** of impact using K-Means on Bengaluru's road network

---

## 🏗️ Architecture

```
Next.js 15 Frontend  (:3000)
        │
        │  POST /api/predict
        ▼
Go + Gin Backend  (:8080)
        │
        │  POST /infer  (internal)
        ▼
Python FastAPI ML Sidecar  (:8001)
        │
        │  LightGBM + XGBoost + MLP + TabNet → Stacking Meta-Learner
        ▼
  Severity · Confidence · Probabilities · Resource Recommendations
```

---

## 🤖 ML Models

| Model | Role |
|---|---|
| **LightGBM** | Base learner — best single model |
| **XGBoost** | Base learner |
| **MLP (sklearn)** | Base learner — captures non-linear patterns |
| **TabNet** | Base learner (deep tabular learning) |
| **Meta-Learner** | Stacks base model outputs → final prediction |
| **KMeans (20 clusters)** | Geo-cluster assignment across Bengaluru |

**Severity Classes:** `0 = Low` · `1 = Medium` · `2 = High` · `3 = Critical`

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, TailwindCSS |
| Backend | Go 1.21+, Gin framework |
| ML Sidecar | Python 3.10+, FastAPI, scikit-learn, LightGBM, XGBoost, PyTorch |
| Maps | Leaflet.js (Bengaluru interactive map) |
| Containerization | Docker, Docker Compose |

---

## 🚀 Quick Start (3 terminals)

### Prerequisites
- **Go** 1.21+
- **Python** 3.10+ (with pip)
- **Node.js** 18+

### Terminal 1 — Python ML Sidecar

```bash
cd ml_sidecar
pip install -r requirements.txt
python -m uvicorn main:app --port 8001 --reload
```
Runs on → http://localhost:8001

### Terminal 2 — Go Backend

```bash
cd backend
go run main.go
```
Runs on → http://localhost:8080

### Terminal 3 — Next.js Frontend

```bash
cd frontend
npm install
npm run dev
```
Runs on → http://localhost:3000

---

## ⚙️ Environment Variables

### Go Backend (`backend/`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | Port for the Go server |
| `SIDECAR_URL` | `http://localhost:8001` | URL of the Python ML sidecar |

### Next.js Frontend — create `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## 🔌 API Reference

### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/predict` | Predict congestion severity |
| `GET` | `/api/meta` | Get corridors, zones, police stations |

### POST `/api/predict` — Request

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

### POST `/api/predict` — Response

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

---

## 📁 Project Structure

```
gridlock-flipkart/
├── backend/                    # Go + Gin API server
│   ├── main.go
│   ├── handlers/
│   │   ├── predict.go
│   │   └── health.go
│   ├── services/
│   │   └── inference.go        # Calls Python sidecar
│   ├── models/
│   │   └── types.go
│   └── Dockerfile
├── ml_sidecar/                 # Python FastAPI ML inference
│   ├── main.py
│   ├── predictor.py
│   ├── loader.py
│   ├── config.py
│   ├── generate_pkl_models.py  # Model training script
│   ├── requirements.txt
│   ├── Dockerfile
│   └── astram_models_bundle/   # Trained model weights (.pkl)
├── frontend/                   # Next.js 15 App Router
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── (app)/
│   │   │   ├── dashboard/      # Live map dashboard
│   │   │   ├── predict/        # Prediction form + results
│   │   │   ├── history/        # Past predictions
│   │   │   └── model/          # ML model insights
│   ├── components/
│   │   ├── map/                # BengaluruMap (Leaflet)
│   │   ├── prediction/         # EventForm, AnalysisPopup, Charts
│   │   ├── shared/             # Navbar, GlowBorder, SeverityBadge
│   │   └── ui/                 # Base UI components
│   └── lib/
│       ├── api.ts
│       ├── severity.ts
│       └── validate.ts
├── astram_models_bundle/       # Root-level model charts & weights
├── Flipkart_gridlock.ipynb     # EDA + model training notebook
├── docker-compose.yml
└── README.md
```

---

## 🐳 Docker Compose

To run the entire stack with Docker:

```bash
docker-compose up --build
```

This starts all three services (Frontend, Backend, ML Sidecar) in containers.

---

## 🚢 Deployment
Website url:-https://gridlock-flipkart.vercel.app

### Railway (Go Backend + Python ML Sidecar)

1. Connect your GitHub repo to [Railway](https://railway.app)
2. Create two services pointing to `backend/` and `ml_sidecar/`
3. Set env var: `SIDECAR_URL=http://<sidecar-service>.railway.internal:8001`

### Vercel (Next.js Frontend)

1. Connect your GitHub repo to [Vercel](https://vercel.com), set root to `frontend/`
2. Set env var: `NEXT_PUBLIC_API_URL=https://<your-railway-go-url>`

---

## 📊 Model Performance

Model training, evaluation metrics, and feature importance charts are available in the **[`Flipkart_gridlock.ipynb`](./Flipkart_gridlock.ipynb)** notebook and visualized in the **Model Insights** page of the app.

---

*Built with ❤️ for Flipkart Grid 6.0 — June 2026*
