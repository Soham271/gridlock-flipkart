---
name: btp-project-context
description: "What the BTP project is, its headline results, and the state of the deliverables"
metadata: 
  node_type: memory
  type: project
  originSessionId: deea7e91-4851-4aa0-8775-f06ff7821672
  modified: 2026-08-30T18:03:07.943Z
---

**Event-Driven Traffic Congestion Severity Prediction and Resource
Recommendation System** — B.Tech final-evaluation project, August 2026.

Two stages: a **learned** four-class severity classifier, then a
**deterministic** rule engine that turns severity into a deployment plan
(manpower, barricading, diversion). The rule engine involves no ML at all;
keeping that distinction clear matters in the viva.

**Data.** 8,173 anonymised Bengaluru traffic events, 46 raw columns to 30
engineered features. No severity column exists, so the target is built as
`priority` x `requires_road_closure` -> 0–3, and **both source fields are then
dropped** to avoid leaking the definition.

**Class distribution (the crux):** Low 2,764 (33.8%), Medium 379 (4.6%),
High 4,733 (57.9%), Critical 297 (3.6%). Low + High = 91.7%.

**Headline results** (test n = 1,635):

| Model | Accuracy | Macro-F1 | Critical recall |
|---|---|---|---|
| LightGBM | 0.9223 | **0.6949** | 0.32 |
| XGBoost | 0.9168 | 0.6906 | **0.36** |
| MLP | 0.9242 | 0.5843 | 0.03 |
| TabNet | **0.9254** | 0.6027 | 0.10 |
| Stacked ensemble | 0.8948 | 0.6639 | 0.34 |

**Central argument:** accuracy misleads on imbalanced safety data. TabNet wins
accuracy, LightGBM wins macro-F1 — ranking by accuracy picks the wrong model.
The MLP is 92.4% accurate with 3% Critical recall. The only two models with
usable Critical recall are the only two trained with class-balanced weighting
(`w_c = n / (C n_c)`, Critical/High ratio about 16).

**Two honest negatives to defend:** stacking did *not* beat the base models
(lowest accuracy of five), and best Critical recall is only 0.36.

**Deployment.** Next.js `:3000` -> Go/Gin `:8080` -> FastAPI sidecar `:8001`,
Docker Compose. Note the shipped `ml_sidecar/astram_models_bundle/` has **no
TabNet pickle** — the running service uses three base models plus the
meta-learner, while the thesis reports four. Worth knowing if asked.

Deliverables: `Thesis_Report/` (LaTeX thesis, 7 chapters, **no equations**) and
`Thesis_Report/presentation_latex/` (Beamer deck, 22 slides, builds clean).
Related: [[btp-presentation-speaking-split]], [[btp-literature-gap-risk]].
