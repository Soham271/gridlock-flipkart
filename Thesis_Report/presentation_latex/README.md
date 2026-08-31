# BTP Final Evaluation Presentation

Beamer deck. **22 slides** = title + 20 content + thank you.

## Compiling on Overleaf
1. Upload this whole folder (or zip it and use *New Project → Upload Project*).
2. Set **Menu → Compiler → pdfLaTeX**.
3. Set **Main document → `main.tex`**.
4. Compile **twice** so the Outline page picks up the section list.

Locally: `pdflatex main.tex && pdflatex main.tex`

## Files
| File | Contents |
|---|---|
| `main.tex` | Document class + `\input` list. Reorder or comment out a section here. |
| `preamble.tex` | Packages, Beamer theme, colour scheme, helper macros (`\hl`, `\bad`, `\amb`). |
| `titlepage.tex` | Title, authors, roll numbers, supervisor, institute. |
| `sections/*.tex` | One file per section — edit these. |
| `figs/` | All figures (generated from the notebook). |

## Slide map
| # | Slide | File |
|---|---|---|
| 1–2 | Title, Outline | `01-title-outline.tex` |
| 3 | Motivation | `02-motivation.tex` |
| 4 | Gap in existing work | `03-background.tex` |
| 5 | Target construction + imbalance | `04-labelling.tex` |
| 6 | Objectives | `05-objectives.tex` |
| 7 | Dataset + missing-value audit | `06-dataset.tex` |
| 8 | Feature engineering + K-Means | `07-features.tex` |
| 9–10 | Pipeline diagram, base learners | `08-architecture.tex` |
| 11 | Out-of-fold stacking | `09-stacking.tex` |
| 12 | Precision / recall / macro-F1 | `10-evaluation.tex` |
| 13–15 | Overall results, per-class, feature importance | `11-results.tex` |
| 16–17 | Rule engine, worked example | `12-recommendation.tex` |
| 18 | System architecture | `13-deployment.tex` |
| 19 | Limitations + future scope | `14-limitations.tex` |
| 20 | Conclusion | `15-conclusion.tex` |
| 21–22 | References, thank you | `16-closing.tex` |

## Colours (`preamble.tex`)
`astramInk` structure · `astramAmber` accent · `astramRed` alert blocks ·
`astramGreen` example blocks. Change these in one place to restyle the deck.

## Notes
- Diagrams are native TikZ, so they scale cleanly and stay editable.
- Some frames use `[shrink]` to auto-fit. If you add text to one and it
  overflows, either trim it or raise the shrink limit (`[shrink=10]`).
