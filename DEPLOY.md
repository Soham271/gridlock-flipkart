# Deployment Guide — Day 5

Deploy **ASTRAM Gridlock** to production before **21 June 2026, 11:59 PM**.

```
Vercel (frontend)  ──HTTPS──►  Railway Go API (:8080)
                                    │
                                    ▼ (private network)
                              Railway Python ML (:8001)
```

---

## Prerequisites

- GitHub repo pushed: `gridlock-flipkart`
- Model files present in `ml_sidecar/astram_models_bundle/` (or built via Docker)
- Accounts: [Railway](https://railway.app), [Vercel](https://vercel.com)

---

## Part 1 — Railway (Go + Python)

### Step 1: Create project

1. Go to [railway.app](https://railway.app) → **New Project**
2. **Deploy from GitHub repo** → select `gridlock-flipkart`

### Step 2: Deploy ML sidecar

1. **Add Service** → select same repo
2. Set **Root Directory** to `ml_sidecar`
3. Railway will use `ml_sidecar/Dockerfile`
4. Set **Port** to `8001` (or let Railway detect `EXPOSE 8001`)
5. **Do not** assign a public domain to the sidecar (internal only)

> First deploy may take 5–10 min (PyTorch + model load). Sidecar needs ≥1GB RAM if TabNet is enabled.

### Step 3: Deploy Go backend

1. **Add Service** → same repo
2. Set **Root Directory** to `backend`
3. Uses `backend/Dockerfile`
4. Add environment variable:

| Variable | Value |
|----------|-------|
| `SIDECAR_URL` | `http://<sidecar-service-name>.railway.internal:8001` |
| `PORT` | `8080` (Railway may set this automatically) |

5. Generate a **public domain** for the Go service (e.g. `astram-api.up.railway.app`)

### Step 4: Verify backend

```bash
curl https://YOUR-GO-URL.railway.app/api/health
```

Expected:

```json
{
  "status": "ok",
  "service": "astram-gridlock-api",
  "sidecar_status": "ok"
}
```

Test prediction:

```bash
curl -X POST https://YOUR-GO-URL.railway.app/api/predict \
  -H "Content-Type: application/json" \
  -d "{\"latitude\":12.9716,\"longitude\":77.5946,\"event_type\":\"planned\",\"event_cause\":\"public_event\",\"start_hour\":18,\"day_of_week\":3,\"month\":6,\"day\":18,\"corridor\":\"ORR East 1\"}"
```

---

## Part 2 — Vercel (Next.js frontend)

### Option A: Vercel dashboard

1. [vercel.com](https://vercel.com) → **Add New Project**
2. Import GitHub repo
3. Set **Root Directory** to `frontend`
4. Framework: **Next.js** (auto-detected)
5. Environment variable:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-GO-URL.railway.app` |

6. **Deploy**

### Option B: CLI

```bash
cd frontend
npx vercel --prod
```

Set `NEXT_PUBLIC_API_URL` when prompted or in the Vercel dashboard.

### Verify

1. Open your Vercel URL
2. Go to **Predict** → submit an event
3. Confirm severity + recommendations appear
4. Check **Dashboard** and **History**

---

## Part 3 — Local Docker test (before Railway)

From project root:

```bash
docker compose up --build
```

Then:

```bash
curl http://localhost:8080/api/health
curl -X POST http://localhost:8080/api/predict -H "Content-Type: application/json" -d "{...}"
```

---

## Demo scenarios (for slides / submission)

Run these on production **Predict** page:

| # | Scenario | Inputs | Expected |
|---|----------|--------|----------|
| 1 | Cricket at Chinnaswamy | planned, public_event, 18:00, lat `12.9784`, lon `77.5998`, ORR corridor | High / Critical |
| 2 | Vehicle breakdown on ORR | unplanned, vehicle_breakdown, 09:00, ORR East 1 | High |
| 3 | Water logging | unplanned, waterlogging, 14:00, off-corridor | Medium |
| 4 | Minor off-corridor incident | unplanned, accident, 11:00, Non-corridor, short duration | Low |

Screenshot each result: severity badge, probability chart, resource panel, map pin.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `sidecar_status: unreachable` | Check `SIDECAR_URL` uses `.railway.internal` hostname |
| CORS errors | Go CORS is open; ensure Vercel env points to correct Go URL |
| 503 on predict | Sidecar still loading models — wait 2–3 min after deploy |
| OOM on Railway | Disable TabNet or upgrade plan; use `python:3.11-slim` image |
| Frontend can't reach API | `NEXT_PUBLIC_API_URL` must be HTTPS Go URL, no trailing slash |

---

## Submission checklist

- [ ] Railway Go + Python both green
- [ ] Vercel frontend live
- [ ] End-to-end predict works on production URL
- [ ] Tested on mobile browser
- [ ] 4 demo scenarios screenshotted
- [ ] Submit before **21 June 2026, 11:59 PM**
