"use client"
import { useState, useEffect } from "react"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  IconX,
  IconZoomIn,
  IconDatabase,
  IconAdjustmentsHorizontal,
  IconTargetArrow,
  IconAlertTriangle,
} from "@tabler/icons-react"
import { pageContainer as container, fadeUp as item, gridItem } from "@/lib/motion"

/* Held-out test set: 1,635 events. Figures from the evaluation in Ch. 7. */
const RESULTS = [
  { model: "LightGBM",         accuracy: 0.9223, macroF1: 0.6949, weightedF1: 0.9148, criticalRecall: 0.32 },
  { model: "XGBoost",          accuracy: 0.9168, macroF1: 0.6906, weightedF1: 0.9114, criticalRecall: 0.36 },
  { model: "MLP-NN",           accuracy: 0.9242, macroF1: 0.5843, weightedF1: 0.8992, criticalRecall: 0.03 },
  { model: "TabNet",           accuracy: 0.9254, macroF1: 0.6027, weightedF1: 0.9020, criticalRecall: 0.10 },
  { model: "Stacked Ensemble", accuracy: 0.8948, macroF1: 0.6639, weightedF1: 0.8968, criticalRecall: 0.34 },
]

const BEST = {
  accuracy:       Math.max(...RESULTS.map(r => r.accuracy)),
  macroF1:        Math.max(...RESULTS.map(r => r.macroF1)),
  weightedF1:     Math.max(...RESULTS.map(r => r.weightedF1)),
  criticalRecall: Math.max(...RESULTS.map(r => r.criticalRecall)),
}

/* `ratio` is each PNG's true width/height — the card matches it so nothing letterboxes. */
const CHARTS = [
  { file: "model_comparison.png",          ratio: 3.20, title: "Model Comparison",            description: "Accuracy, macro-F1, and weighted-F1 across the four base learners and the stacked ensemble. Accuracy spans a narrow 89–93%; macro-F1 spreads more than three times as wide.",             section: "Performance" },
  { file: "confusion_matrices.png",         ratio: 3.60, title: "Confusion Matrices",          description: "Per-class predictions for LightGBM, the stacked ensemble, and TabNet on the held-out test set. The Critical row is where the models diverge.",                                              section: "Performance" },
  { file: "lgbm_feature_importance.png",    ratio: 0.95, title: "LightGBM Feature Importance", description: "Split-based importances for the strongest base model. Geographic cluster, corridor and police-station identifiers, event cause, and the duration fields sit near the top.",                    section: "Performance" },
  { file: "mlp_learning_curve.png",         ratio: 2.25, title: "MLP Learning Curve",          description: "Training vs. validation loss across iterations for the MLP. Early stopping on a 15% validation split halts training once validation loss stops improving.",                                  section: "Performance" },
  { file: "target_distribution.png",        ratio: 2.80, title: "Target Class Distribution",   description: "Severity labels across all 8,173 events, and how event cause splits across them. Low and High alone account for 91.7% of the data.",                                                          section: "Data" },
  { file: "distributions.png",              ratio: 2.25, title: "Feature Distributions",       description: "Value counts for the key categorical fields — event type, event cause, status, priority, corridor, and police station — across the full dataset.",                                            section: "Data" },
  { file: "feature_target_correlation.png", ratio: 0.76, title: "Feature–Target Correlation",  description: "Absolute Pearson correlation of each engineered feature with the severity target. A sanity check before training, not a substitute for the model-based importances.",                         section: "Data" },
  { file: "geo_clusters.png",               ratio: 1.25, title: "Geo Clusters (KMeans k=20)",  description: "20 geographic clusters fitted over event coordinates across Bengaluru. The cluster id becomes a feature, letting models learn regional severity without memorising coordinates.",             section: "Data" },
  { file: "temporal_overview.png",          ratio: 3.50, title: "Temporal Overview",           description: "Incident frequency by hour of day and day of week, with the morning (7–10) and evening (17–21) rush windows shaded.",                                                                        section: "Data" },
  { file: "missing_values.png",             ratio: 1.18, title: "Missing Value Analysis",      description: "Missingness across all 46 raw columns. Fields above 96% were dropped; the middle band — junction 69.3%, zone 57.9%, veh_type 40.2% — was kept with an explicit unknown category.",           section: "Data" },
]

const SECTIONS = ["Performance", "Data"]

const SUMMARY = [
  { label: "Events",            value: "8,173",  note: "1,635 held out",     icon: IconDatabase },
  { label: "Features",          value: "30",     note: "spatial · temporal · contextual", icon: IconAdjustmentsHorizontal },
  { label: "Best Macro-F1",     value: "0.6949", note: "LightGBM",           icon: IconTargetArrow },
  { label: "Best Critical Recall", value: "0.36", note: "XGBoost",           icon: IconAlertTriangle },
]

const fmt = (n: number, d = 4) => n.toFixed(d)

export default function ModelPage() {
  const reduced = useReducedMotion()
  const [active, setActive] = useState("Performance")
  const [zoom, setZoom]     = useState<typeof CHARTS[number] | null>(null)

  useEffect(() => {
    if (!zoom) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setZoom(null) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [zoom])

  const visible = CHARTS.filter(c => c.section === active)

  return (
    <motion.div
      variants={reduced ? {} : container}
      initial="hidden"
      animate="show"
      className="px-6 py-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={reduced ? {} : item}>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight">Model Performance</h1>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-0.5">
          Stacked ensemble — LightGBM + XGBoost + MLP + TabNet → meta-learner
        </p>
      </motion.div>

      {/* Summary strip */}
      <motion.div variants={reduced ? {} : item}
        className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-lg overflow-hidden">
        {SUMMARY.map(({ label, value, note, icon: Icon }) => (
          <div key={label} className="bg-[var(--bg-elevated-1)] p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{label}</p>
              <Icon size={14} stroke={1.5} className="text-[var(--text-secondary)]" />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="font-data text-xl font-medium text-[var(--text-primary)] tabular-nums leading-none">{value}</p>
              <p className="text-[11px] text-[var(--text-tertiary)]">{note}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Headline finding */}
      <motion.div variants={reduced ? {} : item}
        className="surface rounded-lg border-l-2 !border-l-[var(--severity-critical)] px-5 py-4 flex flex-col gap-1.5">
        <p className="font-display text-sm font-semibold text-[var(--text-primary)]">
          92.4% accurate — and it misses 97% of Critical events
        </p>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-4xl">
          The MLP reports the second-highest accuracy on this test set alongside a Critical-class recall of{" "}
          <span className="font-data text-[var(--severity-critical)]">0.03</span>. Its precision on that class is a
          perfect <span className="font-data">1.00</span> — when it says Critical it is never wrong, but it says so for
          only 2 of the 59 truly Critical events, letting the rest through labelled as something less urgent. With
          91.7% of events being Low or High, accuracy rewards exactly that behaviour, which is why every model here is
          judged on macro-F1 and per-class recall instead.
        </p>
      </motion.div>

      {/* Results table */}
      <motion.div variants={reduced ? {} : item} className="surface rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated-1)] flex items-baseline justify-between gap-3 flex-wrap">
          <span className="text-xs font-medium text-[var(--text-primary)]">Evaluation — held-out test set</span>
          <span className="text-[11px] text-[var(--text-tertiary)] font-data">n = 1,635 · Critical support = 59</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[var(--bg-elevated-1)]">
                <th className="text-left  font-medium px-4 py-2.5 text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Model</th>
                <th className="text-right font-medium px-4 py-2.5 text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)] whitespace-nowrap">Accuracy</th>
                <th className="text-right font-medium px-4 py-2.5 text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)] whitespace-nowrap">Macro-F1</th>
                <th className="text-right font-medium px-4 py-2.5 text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)] whitespace-nowrap">Weighted-F1</th>
                <th className="text-right font-medium px-4 py-2.5 text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)] whitespace-nowrap">Critical Recall</th>
              </tr>
            </thead>
            <tbody>
              {RESULTS.map(r => (
                <tr key={r.model} className="border-t border-[var(--border-subtle)]">
                  <td className="px-4 py-2.5 text-[var(--text-primary)] whitespace-nowrap">{r.model}</td>
                  <td className={`px-4 py-2.5 text-right font-data tabular-nums ${r.accuracy === BEST.accuracy ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-secondary)]"}`}>{fmt(r.accuracy)}</td>
                  <td className={`px-4 py-2.5 text-right font-data tabular-nums ${r.macroF1 === BEST.macroF1 ? "text-[var(--accent-signal)] font-medium" : "text-[var(--text-secondary)]"}`}>{fmt(r.macroF1)}</td>
                  <td className={`px-4 py-2.5 text-right font-data tabular-nums ${r.weightedF1 === BEST.weightedF1 ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-secondary)]"}`}>{fmt(r.weightedF1)}</td>
                  <td className={`px-4 py-2.5 text-right font-data tabular-nums ${
                    r.criticalRecall === BEST.criticalRecall ? "text-[var(--accent-signal)] font-medium"
                    : r.criticalRecall < 0.15 ? "text-[var(--severity-critical)]"
                    : "text-[var(--text-secondary)]"}`}>{fmt(r.criticalRecall, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated-1)]">
          <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
            TabNet takes the highest accuracy (0.9254) but LightGBM leads macro-F1 (0.6949) — ranking by accuracy alone
            would pick the wrong model. The stacked ensemble trades overall accuracy for more even coverage across
            classes, landing second on Critical recall.
          </p>
        </div>
      </motion.div>

      {/* Section tabs */}
      <motion.div variants={reduced ? {} : item} className="flex gap-2" role="tablist" aria-label="Chart sections">
        {SECTIONS.map(s => (
          <button
            key={s}
            role="tab"
            aria-selected={active === s}
            onClick={() => setActive(s)}
            className={`px-5 py-2 text-xs font-medium rounded-lg transition-colors
              ${active === s ? "bg-[var(--accent-signal)]/10 text-[var(--accent-signal)] border border-[var(--accent-signal)]/20 shadow-[0_0_15px_rgba(242,169,59,0.15)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated-2)] border border-transparent"}`}
          >
            {s}
          </button>
        ))}
      </motion.div>

      {/* Chart grid */}
      <motion.div
        key={active}
        variants={reduced ? {} : { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start"
      >
        {visible.map(c => (
          <motion.div
            key={c.file}
            variants={reduced ? {} : gridItem}
            whileHover={reduced ? {} : { y: -3, transition: { duration: 0.15 } }}
            role="button"
            tabIndex={0}
            aria-label={`Enlarge chart: ${c.title}`}
            className="surface border border-[var(--border-subtle)] rounded-lg overflow-hidden cursor-pointer group hover:border-[var(--border-hover)] hover:shadow-lg hover:shadow-black/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-signal)]"
            onClick={() => setZoom(c)}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setZoom(c) }
            }}
          >
            <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-elevated-1)]">
              <span className="text-xs text-[var(--text-secondary)] font-medium group-hover:text-[var(--text-primary)] transition-colors">{c.title}</span>
              <IconZoomIn size={13} stroke={1.5} className="text-[var(--text-tertiary)] group-hover:text-[var(--accent-signal)] transition-colors" />
            </div>
            <div className="relative w-full bg-[#0a0a0d]" style={{ aspectRatio: String(c.ratio) }}>
              <Image
                src={`/model-charts/${c.file}`}
                alt={`${c.title}. ${c.description}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="px-4 py-3 bg-[var(--bg-elevated-1)]">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{c.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {zoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 backdrop-blur-sm"
            onClick={() => setZoom(null)}
            role="dialog"
            aria-modal="true"
            aria-label={zoom.title}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-5xl w-full surface shadow-2xl border border-[var(--border-subtle)] rounded-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated-1)] flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{zoom.title}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{zoom.description}</p>
                </div>
                <button
                  onClick={() => setZoom(null)}
                  aria-label="Close"
                  autoFocus
                  className="btn-ghost !p-1.5 shrink-0 hover:bg-[var(--bg-elevated-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-signal)] rounded"
                >
                  <IconX size={16} stroke={1.5} className="text-[var(--text-secondary)]" />
                </button>
              </div>
              <div className="relative w-full bg-[#0a0a0d]" style={{ aspectRatio: String(zoom.ratio) }}>
                <Image src={`/model-charts/${zoom.file}`} alt={`${zoom.title}. ${zoom.description}`} fill className="object-contain" sizes="(max-width: 1024px) 100vw, 1024px" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
