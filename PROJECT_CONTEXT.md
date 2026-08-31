# Project Context — read this first

Handover document for this B.Tech project. Point any new assistant session or
new machine at this file instead of re-explaining the project.

---

## 1. Team

| Name | Roll | Note |
|---|---|---|
| Aman Kumar | 2023IMT-010 | |
| **Sahil Pal** | **2023IMT-069** | repository owner |
| Vishwajit Sarak Patil | 2023IMT-071 | |

Supervisor: **Dr. Saswata Roy**, Department of Information Technology,
ABV-IIITM Gwalior. B.Tech Project, Final Evaluation, August 2026.

Author order on deliverables is **Aman, Sahil, Vishwajit**.

> **Known inconsistency:** the thesis front matter
> (`Thesis_Report/FrontPages/title_page.tex` and `Certificate.tex`) spells the
> name **"Viswajit"** and uses the old author order. The presentation was
> corrected to **"Vishwajit"** and the new order; the thesis has not been.
> The certificate is a signed document, so this is worth fixing.

---

## 2. What the system does

**Event-Driven Traffic Congestion Severity Prediction and Resource
Recommendation System.**

When a traffic event is first reported, the control room must decide how much
to deploy — officers, barricades, diversions — **before anyone has reached the
site**. Today that decision is made on experience alone.

Two stages:

1. **Learned.** A classifier predicts severity (Low / Medium / High / Critical)
   from the event's location, cause, time and context.
2. **Deterministic.** A fixed rule table converts severity into a concrete
   deployment: manpower range, barricading, diversion, delay estimate.

Stage 2 involves **no machine learning at all**. Keeping that boundary clear
matters — it is what makes the recommendation auditable and tunable without
retraining.

---

## 3. Data

- **8,173** anonymised Bengaluru traffic events, **46** raw columns.
- One row = one incident. It is an **event log**, not a sensor feed. That is
  what makes this *non-recurring* (event-driven) congestion rather than the
  recurring, sensor-driven kind most deep-learning traffic work targets.
- **46 raw columns → 30 engineered features.** Not a subtraction: ~23 columns
  were dropped (near-empty ones, database keys, and the two target-source
  fields) and new features were derived.

### Missing-value bands
| Band | Columns | Handling |
|---|---|---|
| 96–100% missing | `comment`, `map_file`, `meta_data`, resolution/truck fields | dropped |
| 40–70% missing | `junction` 69.3%, `closed_datetime` 61.6%, `zone` 57.9%, `veh_type` 40.2% | kept with "unknown" category or a presence flag |
| 0% missing | coordinates, event cause, priority, closure flag | retained |
| identifiers | `id`, `client_id`, `created_by_id` | dropped |

### The 30 features
**Spatial (9)** `latitude` `longitude` `location_cluster` `pin_code` `corridor`
`is_corridor` `police_station` `zone` `junction`

**Temporal (10)** `hour` `day_of_week` `month` `day` `day_of_year` `is_weekend`
`is_night` `is_morning_rush` `is_evening_rush` `time_bucket`

**Event context (7)** `event_type` `event_cause` `veh_type_simple` `status`
`duration_mins` `resolution_mins` `authenticated_flag`

**Presence flags (4)** `has_end_location` `has_description` `has_end_time`
`has_been_closed`

---

## 4. The constructed target (the key methodological idea)

**No severity column exists anywhere in the raw log.** The target was built by
crossing two fields the control room records independently for its own
operational purposes:

| `priority` | `requires_road_closure` | code | label |
|---|---|---|---|
| Low | No | 0 | Low |
| Low | Yes | 1 | Medium |
| High | No | 2 | High |
| High | Yes | 3 | Critical |

**Both source fields were then removed from the feature set.** If left in, a
model would re-learn this deterministic mapping instead of inferring severity
from circumstances — and would be unusable at first report, when no priority
has been assigned yet. This is **data leakage** avoidance.

### Class distribution
| Code | Label | Count | Share |
|---|---|---|---|
| 0 | Low | 2,764 | 33.8% |
| 1 | Medium | 379 | 4.6% |
| 2 | High | 4,733 | 57.9% |
| 3 | Critical | 297 | 3.6% |

**Low + High = 91.7%.** This single fact drives the entire evaluation strategy.

---

## 5. Models and results

Split: **6,538 train / 1,635 test**, stratified. K-Means (K=20) on coordinates
produces `location_cluster`; K came from a heuristic
(`min(20, max(5, n // 200))`), **not** an elbow or silhouette analysis.

Four base learners → 16 out-of-fold meta-features (4 models × 4 class
probabilities) → LightGBM meta-learner.

| Model | Accuracy | Macro-F1 | Critical recall |
|---|---|---|---|
| LightGBM | 0.9223 | **0.6949** | 0.32 |
| XGBoost | 0.9168 | 0.6906 | **0.36** |
| MLP | 0.9242 | 0.5843 | 0.03 |
| TabNet | **0.9254** | 0.6027 | 0.10 |
| Stacked ensemble | 0.8948 | 0.6639 | 0.34 |

Majority classes are easy for every model: Low F1 0.93–0.94, High F1 0.95–0.97.
The entire macro-F1 spread comes from the two rare classes.

### Central argument
**Accuracy misleads on imbalanced, safety-relevant data.** TabNet has the
highest accuracy; LightGBM has the best macro-F1 — ranking by accuracy picks
the wrong model. The MLP is **92.4% accurate with 3% Critical recall**: it
catches 2 of 59 Critical events and misses 57.

The only two models with usable Critical recall are the only two trained with
class-balanced weighting, `w_c = n / (C · n_c)`, giving Critical roughly **16×**
the weight of High.

### Two honest negative results (do not hide these)
1. **Stacking did not beat the base models** — lowest accuracy of the five
   (0.8948). Likely causes: lighter in-fold model copies, and under ~50 Critical
   examples per fold.
2. **Critical recall peaks at 0.36** — usable as decision support, not safe for
   unsupervised deployment.

---

## 6. Rule engine (stage 2)

| Severity | Officers | Delay | Barricading | Diversion |
|---|---|---|---|---|
| Low | 2–4 | 15 min | Cones / indicators | None |
| Medium | 4–8 | 30 min | Partial, 1 lane + marshal | Advisory route |
| High | 8–14 | 60 min | Full, both sides + 2 marshals | Mandatory + signage |
| Critical | 15–25 | 90 min | Corridor lockdown + chain | Police-escorted |

Allocation rule, **truncating at each step**:

```
n = floor( floor(n_base × 1.4^corridor) × 1.25^peak )
```

corridor = high-density corridor, peak = 7–10 or 17–21 hours. Worked example:
High severity on a corridor at peak gives 8→11→13 and 14→19→23, i.e.
**13–23 officers** (not 14–25 — the truncation happens twice).

Cause rules: `accident` ≥ High keeps an ambulance lane open and puts a trauma
centre on standby; `public_event` ≥ High adds a crowd-control perimeter;
pre-announced events deploy 2 h early.

---

## 7. Deployment

```
Browser (Next.js 16) :3000  →  Go/Gin API :8080  →  FastAPI sidecar :8001
```

Endpoints: `POST /api/predict`, `GET /api/meta`, `GET /api/locate`,
`GET /api/health`. Containerised with Docker Compose; the model bundle loads
once at sidecar startup.

Why a separate Python sidecar: the trained models are Python objects Go cannot
load, but Go handles HTTP, concurrency and validation better.

### Two deployment caveats worth knowing
- **No TabNet in the shipped bundle.** `ml_sidecar/astram_models_bundle/`
  contains LightGBM, XGBoost, MLP and the meta-learner only. The running
  service uses three base models; the thesis reports four.
- **Training–serving skew.** `resolution_mins` and `has_been_closed` are
  hardcoded to `0` in `predictor.py` at inference — they cannot be known when an
  event is first reported — but had real values during training. Both rank low
  in feature importance, which limits the damage.

---

## 8. Deliverables

| Path | What |
|---|---|
| `Thesis_Report/` | LaTeX thesis, 7 chapters. **Contains no equations** — everything is prose. |
| `Thesis_Report/presentation_latex/` | Beamer deck, 22 slides, builds clean (0 overfull boxes). Overleaf-ready, one file per section. |
| `Thesis_Report/presentation/` | Earlier PowerPoint version plus its generator script. |
| `Thesis_Report/diagrams/astram-ml.drawio` | Editable draw.io diagrams. |
| `Flipkart_gridlock.ipynb` | Training notebook. Cell 10 holds the missing-value report; cell 15 the feature engineering and K-Means. |
| `frontend/`, `backend/`, `ml_sidecar/` | The deployed stack. |

The Beamer deck defines four formulas verified against the implementation:
class-balanced weights, out-of-fold meta-feature construction, macro-F1, and the
rule-engine allocation rule. **The thesis states none of these** — adding them
would make the two documents consistent.

---

## 9. Presentation — speaking split

Sahil presents the **introduction plus slides 3, 4, 5, 6, 18, 19**:

| Slide | Title |
|---|---|
| 1 | Title / introduction |
| 3 | Motivation: Why Event Severity? |
| 4 | The Gap in Existing Work |
| 5 | Constructing a Target That Does Not Exist |
| 6 | Objectives |
| 18 | System Architecture and Request Flow |
| 19 | Limitations and Future Scope |

So his half is **framing plus system and limitations**; the modelling core
(slides 9–17) belongs to Aman and Vishwajit. Slide numbers shift if frames are
added or removed.

Slides marked with `\key{...}` carry a yellow highlighter on the phrase that
must land. The macro is defined in `preamble.tex`.

---

## 10. Viva risk: the novelty claim on slide 4

Chapter 3 and slide 4 claim severity prediction "almost never" produces an
operational recommendation. **That is overstated.** Work that undercuts it:

- *A Review of Incident Prediction, Resource Allocation, and Dispatch Models for
  Emergency Management* (arXiv 2006.04200; also *Accident Analysis &
  Prevention*) — a survey of exactly that pipeline.
- *IncidentResponseGPT* (arXiv 2404.18550) and *Automated Traffic Incident
  Response Plans using Generative AI* (arXiv 2506.03381).
- *ALNS-based traffic-police-patrol-vehicle assignment* (Traffic Injury
  Prevention, 2024).

**Defensible reframe:** that literature mostly optimises dispatch for an
incident *already assessed*. This project produces a plan **at first report,
before anyone has seen the site**, from a model trained without the priority
field.

Also methodologically close: *Accident-Driven Congestion Prediction and
Simulation* (arXiv 2507.22529) — like this project, it had to **construct**
congestion labels via clustering rather than read them off.

*(Sourced from web search summaries, not full reads — verify before citing.)*

---

## 11. Open items

- Thesis front matter: fix "Viswajit" → "Vishwajit" and the author order.
- Consider adding the four formulas to the thesis so it matches the deck.
- Chapter 7 §7.5 overstates the feature-importance finding: the chart shows
  `longitude`/`latitude` and fine-grained time ranking highest, **not**
  location cluster and corridor as the text implies.
- `Thesis_Report/FrontPages/thapar_logo.eps` and `chapters/thapar_logo.eps` are
  leftovers from the template and belong to a different institution.
- Docker Compose was never run end to end; the four API routes have not been
  verified live.

---

## 12. Restoring assistant memory on another machine

`.claude/memory/` in this repo holds the memory files from the original machine.
Claude Code stores memory per-project under
`~/.claude/projects/<encoded-project-path>/memory/`, so on a new machine copy
them there, or simply point the session at this file.
