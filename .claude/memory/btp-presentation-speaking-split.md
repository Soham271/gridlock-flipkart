---
name: btp-presentation-speaking-split
description: Which presentation slides Sahil personally speaks on in the BTP final evaluation
metadata: 
  node_type: memory
  type: project
  originSessionId: deea7e91-4851-4aa0-8775-f06ff7821672
  modified: 2026-08-30T18:02:51.450Z
---

For the BTP final-evaluation viva, **Sahil speaks the introduction plus slides
3, 4, 5, 6, 18, 19** of `Thesis_Report/presentation_latex/main.pdf` (22 slides).

| Slide | Title |
|---|---|
| 1 | Title page (the "introduction") |
| 3 | Motivation: Why Event Severity? |
| 4 | The Gap in Existing Work |
| 5 | Constructing a Target That Does Not Exist |
| 6 | Objectives |
| 18 | System Architecture and Request Flow |
| 19 | Limitations and Future Scope |

So his half is **framing and system/limitations**, not the modelling core
(slides 9–17: pipeline, base learners, stacking, metrics, results, rule engine)
which Aman and Vishwajit cover.

Prep implications for his slides specifically:
- Slide 4 claims a research gap that recent work weakens. See
  [[btp-literature-gap-risk]] before he defends it.
- Slide 5 is the target-construction/leakage argument: priority x
  requires_road_closure -> severity 0-3, both source fields then dropped.
- Slide 19 must own two negative results honestly: stacking underperformed
  (0.8948, lowest accuracy) and Critical recall peaks at only 0.36.

Slide numbers shift if frames are added or removed; re-check before the viva.
Related: [[user-identity]], [[btp-project-context]].
