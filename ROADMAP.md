# ASTRAM Gridlock — Project Roadmap
**Theme:** Event-Driven Congestion (Planned & Unplanned)
**Deadline:** 21 June 2026, 11:59 PM
**Today:** 17 June 2026
**Days Available:** 5 days

---

## Tech Stack (Final Decision)

| Layer | Technology | Why |
|---|---|---|
| ML Inference | **Python 3.14 + FastAPI** (internal sidecar) | Models are `.pkl` — must stay in Python |
| API Server | **Go 1.26 + Gin** | Fast, typed, great for REST APIs, easy to deploy |
| Frontend | **Next.js 15** (App Router) + TypeScript | SSR, file-based routing, production-ready |
| Styling | **Tailwind CSS v4 + shadcn/ui** | Fast, consistent, dark-mode friendly |
| Map | **react-leaflet** + OpenStreetMap tiles | Free tiles, no API key needed |
| Charts | **Recharts** | Lightweight, React-native charts |
| Deployment | **Railway** (Go + Python sidecar) + **Vercel** (Next.js) | Free tier, zero-config deploy |
| Version Control | **GitHub** | Required for Railway + Vercel auto-deploy |

---

## Final Folder Structure

```
gridlock-new/
│
├── backend/                         ← Go (Gin) — Main API server
│   ├── main.go                      Entry point, routes, CORS
│   ├── go.mod
│   ├── go.sum
│   ├── handlers/
│   │   ├── predict.go               POST /api/predict
│   │   └── health.go                GET  /api/health
│   ├── services/
│   │   └── inference.go             HTTP client → Python sidecar
│   └── models/
│       └── types.go                 Go structs: PredictRequest, PredictResponse
│
├── ml_sidecar/                      ← Python (FastAPI) — Internal ML only
│   ├── main.py                      FastAPI app, single /infer endpoint
│   ├── predictor.py                 predict_congestion() from notebook
│   ├── config.py                    Model paths, constants
│   ├── requirements.txt
│   └── astram_models_bundle/        ← All .pkl files go here
│       ├── lgbm_model.pkl
│       ├── xgb_model.pkl
│       ├── mlp_model.pkl
│       ├── meta_learner.pkl
│       ├── scaler.pkl
│       ├── label_encoders.pkl
│       ├── kmeans_model.pkl
│       ├── feature_names.pkl
│       └── tabnet_model.zip
│
├── frontend/                        ← Next.js 15 (App Router)
│   ├── app/
│   │   ├── layout.tsx               Root layout with Navbar
│   │   ├── page.tsx                 Dashboard: map + stats
│   │   ├── predict/
│   │   │   └── page.tsx             Event form + results
│   │   └── history/
│   │       └── page.tsx             Past predictions table
│   ├── components/
│   │   ├── map/
│   │   │   ├── BengaluruMap.tsx     react-leaflet map, click to drop pin
│   │   │   └── IncidentPin.tsx      Color-coded severity markers
│   │   ├── prediction/
│   │   │   ├── EventForm.tsx        All input fields
│   │   │   ├── SeverityCard.tsx     Big severity badge + confidence
│   │   │   ├── ProbabilityChart.tsx Recharts bar: Low/Med/High/Critical
│   │   │   └── ResourcePanel.tsx    Officers, barricades, diversion cards
│   │   ├── dashboard/
│   │   │   ├── StatsBar.tsx         Total incidents / avg severity
│   │   │   └── SeverityDonut.tsx    Pie chart of today's severity split
│   │   └── shared/
│   │       ├── Navbar.tsx
│   │       └── SeverityBadge.tsx    Reusable color chip
│   ├── lib/
│   │   └── api.ts                   All fetch calls to Go backend
│   ├── types/
│   │   └── index.ts                 TypeScript types matching Go structs
│   ├── public/
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── package.json
│
├── ROADMAP.md                       ← This file
└── .gitignore
```

---

## Architecture Flow

```
User (Browser)
     │
     ▼
Next.js Frontend (Vercel :443)
     │  POST /api/predict (JSON)
     ▼
Go Gin Server (Railway :8080)
  handlers/predict.go
  services/inference.go
     │  POST http://sidecar:8001/infer
     ▼
Python FastAPI Sidecar (Railway :8001)
  predictor.py
  → loads lgbm + xgb + mlp + tabnet + meta_learner
  → feature engineer → encode → scale → stack probs
  → returns severity + probabilities + recommendations
     │
     ▼ (JSON back up the chain)
Go formats response → Frontend renders:
  - SeverityCard (0–3, colored)
  - ProbabilityChart (4 bars)
  - ResourcePanel (officers, barricades, diversion)
  - Pin dropped on BengaluruMap
```

---

## Day-by-Day Plan

---

### DAY 1 — 17 June (Today) | Foundation

**Goal: Both servers running locally, prediction working end-to-end**

#### Morning (2–3 hrs) — Python Sidecar
- [ ] Create `ml_sidecar/` folder
- [ ] Copy `astram_models_bundle/` into `ml_sidecar/`
- [ ] Write `ml_sidecar/predictor.py` (port notebook Cell 17 + Cell 25)
- [ ] Write `ml_sidecar/main.py` (FastAPI, single `POST /infer` endpoint)
- [ ] Write `ml_sidecar/requirements.txt`
- [ ] Install deps: `py -m pip install fastapi uvicorn lightgbm xgboost scikit-learn pandas numpy joblib pytorch-tabnet`
- [ ] Test: `py -m uvicorn main:app --port 8001`
- [ ] Hit `POST /infer` with curl/Postman → confirm JSON response

#### Afternoon (2–3 hrs) — Go Backend
- [ ] `cd backend && go mod init github.com/yourusername/gridlock`
- [ ] `go get github.com/gin-gonic/gin`
- [ ] Write `models/types.go` (PredictRequest, PredictResponse structs)
- [ ] Write `services/inference.go` (HTTP client calling `localhost:8001/infer`)
- [ ] Write `handlers/predict.go` and `handlers/health.go`
- [ ] Write `main.go` (Gin router, CORS, register routes)
- [ ] Test: `go run main.go` → hit `POST localhost:8080/api/predict`

#### Evening (1 hr) — Verify
- [ ] Start both servers simultaneously
- [ ] Confirm full request chain: curl → Go → Python → Go → curl response
- [ ] Push to GitHub (create repo, initial commit)

---

### DAY 2 — 18 June | Next.js Frontend (Core)

**Goal: Frontend running, form submits and shows results**

#### Morning (3 hrs) — Next.js Setup + Layout
- [ ] `npx create-next-app@latest frontend --typescript --tailwind --app --src-dir=false`
- [ ] `cd frontend && npx shadcn@latest init`
- [ ] Install: `npm install recharts react-leaflet leaflet axios`
- [ ] Install types: `npm install -D @types/leaflet`
- [ ] Create `types/index.ts` — copy Go struct fields as TS interfaces
- [ ] Create `lib/api.ts` — `predictEvent()` fetch function
- [ ] Build `components/shared/Navbar.tsx`
- [ ] Build `app/layout.tsx` with Navbar

#### Afternoon (3 hrs) — Predict Page
- [ ] Build `components/prediction/EventForm.tsx`
  - Fields: event type, cause, date/time picker, corridor dropdown, police station
  - Lat/lon inputs (manual for now, map click on Day 3)
- [ ] Build `components/prediction/SeverityCard.tsx`
  - Large colored badge: 🟢🟡🟠🔴
  - Confidence % bar
- [ ] Build `components/prediction/ProbabilityChart.tsx` (Recharts BarChart)
- [ ] Build `components/prediction/ResourcePanel.tsx`
  - Cards: Officers | Barricading | Diversion | Impact | Special Actions
- [ ] Wire `app/predict/page.tsx` — form → API call → render results

#### Evening (1 hr) — Test
- [ ] Full flow: fill form → submit → results appear
- [ ] Handle loading state, error state
- [ ] Commit

---

### DAY 3 — 19 June | Map + Dashboard

**Goal: Interactive map, dashboard with stats**

#### Morning (3 hrs) — Leaflet Map
- [ ] Build `components/map/BengaluruMap.tsx`
  - Center: `[12.9716, 77.5946]` (Bengaluru)
  - Click handler → sets lat/lon in EventForm state
  - Marker appears at clicked point
- [ ] Build `components/map/IncidentPin.tsx`
  - Custom colored circle markers by severity
- [ ] Add map to Dashboard page (shows all submitted incidents)
- [ ] Add map to Predict page (click to pick location)
- [ ] Fix SSR issue: leaflet only loads client-side (use `dynamic` import with `ssr: false`)

#### Afternoon (2 hrs) — Dashboard
- [ ] Store prediction results in `localStorage` (simple history)
- [ ] Build `components/dashboard/StatsBar.tsx`
  - Total predictions | Most common severity | Peak hour
- [ ] Build `components/dashboard/SeverityDonut.tsx` (Recharts PieChart)
- [ ] `app/page.tsx` — Dashboard with map + stats + recent predictions list

#### Evening (2 hrs) — History Page + Polish
- [ ] `app/history/page.tsx` — table of all past predictions
  - Columns: Time | Location | Event Cause | Severity | Confidence | Officers
- [ ] Add severity color chips (`SeverityBadge.tsx`)
- [ ] Mobile responsiveness check
- [ ] Commit

---

### DAY 4 — 20 June | Polish, Error Handling, Prep for Deploy

**Goal: Production-ready code, no crashes, deploy scripts ready**

#### Morning (2 hrs) — Robustness
- [ ] Go: add proper error responses (4xx/5xx with JSON body)
- [ ] Go: add request timeout for sidecar calls (5s)
- [ ] Go: add `/api/corridors` endpoint (return list from label_encoders.pkl classes)
- [ ] Frontend: populate corridor + police_station dropdowns from API
- [ ] Frontend: form validation (required fields, lat range 12–13, lon range 77–78)

#### Afternoon (2 hrs) — UI Polish
- [ ] Dark/ops-style color theme (dark background, colored severity)
- [ ] Loading skeleton while prediction runs
- [ ] Empty states for dashboard and history
- [ ] Proper favicon, page titles, meta tags
- [ ] Mobile layout fixes

#### Evening (3 hrs) — Deployment Prep
- [ ] Write `ml_sidecar/Dockerfile`
- [ ] Write `backend/Dockerfile`
- [ ] Write `docker-compose.yml` (Go + Python sidecar together, internal network)
- [ ] Update Go `inference.go` to use env var `SIDECAR_URL` (default `localhost:8001`)
- [ ] Update Next.js `lib/api.ts` to use `NEXT_PUBLIC_API_URL` env var
- [ ] Test Docker Compose locally: `docker compose up`
- [ ] Commit everything

---

### DAY 5 — 21 June | Deploy + Final Testing

**Goal: Live on internet, demo-ready by 11:59 PM**

#### Morning (3 hrs) — Deploy Backend to Railway
- [ ] Create Railway account → New Project
- [ ] Connect GitHub repo
- [ ] Add service: `ml_sidecar/` → Railway detects Python, deploy with Dockerfile
- [ ] Add service: `backend/` → Railway detects Go, deploy with Dockerfile
- [ ] Set env var in Go service: `SIDECAR_URL=http://<sidecar-service>.railway.internal:8001`
- [ ] Wait for both to go green ✅
- [ ] Test Railway URL: `curl https://your-go-api.railway.app/api/health`

#### Afternoon (2 hrs) — Deploy Frontend to Vercel
- [ ] `cd frontend && npx vercel --prod` OR connect GitHub on vercel.com
- [ ] Set env var: `NEXT_PUBLIC_API_URL=https://your-go-api.railway.app`
- [ ] Verify deployment: open Vercel URL in browser
- [ ] Test full end-to-end on production

#### Evening (3 hrs) — Final Buffer + Demo Prep
- [ ] Fix any production bugs
- [ ] Test on mobile browser
- [ ] Prepare 3-4 demo scenarios:
  1. Cricket match at Chinnaswamy (planned, public_event, 6 PM, ORR) → Critical
  2. Vehicle breakdown on ORR (unplanned, 9 AM) → High
  3. Water logging (unplanned, afternoon) → Medium
  4. Minor incident, off-corridor (Low)
- [ ] Screenshot all scenarios for slides
- [ ] **Submit by 11:59 PM** ✅

---

## Deployment Architecture (Production)

```
Vercel (Free)                    Railway (Free $5 credit)
─────────────────                ──────────────────────────────
Next.js Frontend    ──HTTPS──►  Go Gin  :8080
                                   │  (internal Railway network)
                                   ▼
                                Python FastAPI  :8001
                                (loads all .pkl at startup)
```

- Go + Python sidecar run on the **same Railway project**, communicate over Railway's internal private network (no public exposure for sidecar)
- Next.js on Vercel calls only the Go API (public HTTPS)

---

## Dockerfiles (Summary)

**`ml_sidecar/Dockerfile`**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

**`backend/Dockerfile`**
```dockerfile
FROM golang:1.26-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o server .

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
```

**`docker-compose.yml`** (local testing)
```yaml
version: "3.9"
services:
  sidecar:
    build: ./ml_sidecar
    ports: ["8001:8001"]
  backend:
    build: ./backend
    ports: ["8080:8080"]
    environment:
      - SIDECAR_URL=http://sidecar:8001
    depends_on: [sidecar]
```

---

## Environment Variables

| Variable | Where | Value |
|---|---|---|
| `SIDECAR_URL` | Go backend (Railway) | `http://sidecar.railway.internal:8001` |
| `PORT` | Go backend | `8080` (set by Railway automatically) |
| `NEXT_PUBLIC_API_URL` | Next.js (Vercel) | `https://your-go-api.railway.app` |

---

## Risk Register

| Risk | Likelihood | Mitigation |
|---|---|---|
| TabNet fails to load (PyTorch size) | Medium | Catch error in loader, skip TabNet, still works with 3-model ensemble |
| Railway free tier memory limit (512MB) | Medium | Use `python:3.11-slim`, skip TabNet in production if needed |
| Leaflet SSR crash in Next.js | High | Always use `dynamic(() => import(...), { ssr: false })` for map components |
| pkl version mismatch (Python 3.11 vs 3.14) | Low-Med | Train on 3.11 in sidecar, models were saved on Colab (3.10/3.11) |
| CORS errors in production | Low | Already handled in Go, double-check Railway URL in Vercel env var |

---

## Progress Tracker

| Day | Target | Status |
|---|---|---|
| 17 June | Python sidecar + Go backend running locally | ⬜ |
| 18 June | Next.js frontend, form + results working | ⬜ |
| 19 June | Map + dashboard + history page | ⬜ |
| 20 June | Polish + Docker + deploy prep | ⬜ |
| 21 June | Live deployment + demo ready | ⬜ |

---

## Quick Commands Reference

```bash
# Python sidecar
cd ml_sidecar
py -m uvicorn main:app --port 8001 --reload

# Go backend
cd backend
go run main.go

# Next.js frontend
cd frontend
npm run dev

# Docker (local full stack)
docker compose up --build

# Deploy frontend to Vercel
cd frontend && npx vercel --prod
```

---

*Last updated: 17 June 2026*
