"use client"
import { motion, useReducedMotion } from "framer-motion"
import { useHistory, clearHistory } from "@/lib/history"
import { downloadReport } from "@/lib/report"
import SeverityBadge from "@/components/shared/SeverityBadge"
import Link from "next/link"
import {
  IconTrash,
  IconFileDownload,
  IconHistory,
  IconScanEye,
} from "@tabler/icons-react"
import { pageContainer as container, fadeUp as item } from "@/lib/motion"

export default function HistoryPage() {
  const reduced  = useReducedMotion()
  const history = useHistory()

  const handleClear = () => clearHistory()

  if (history.length === 0) {
    return (
      <motion.div
        variants={reduced ? {} : container}
        initial="hidden"
        animate="show"
        className="px-6 py-6 max-w-7xl mx-auto"
      >
        <motion.div variants={reduced ? {} : item}>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-6 tracking-tight">History</h1>
        </motion.div>
        <motion.div variants={reduced ? {} : item}
          className="surface border-dashed border-2 border-[var(--border-subtle)] bg-transparent rounded-lg flex flex-col items-center justify-center px-6 py-20 gap-3 text-center">
          <IconHistory size={36} stroke={1} className="text-[var(--text-tertiary)]" />
          <p className="text-sm text-[var(--text-secondary)]">No data yet</p>
          <p className="text-xs text-[var(--text-tertiary)]">Predictions will appear here after you run them</p>
          <Link href="/predict" className="btn-primary mt-2">
            <IconScanEye size={14} /> Run a Prediction
          </Link>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={reduced ? {} : container}
      initial="hidden"
      animate="show"
      className="px-6 py-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={reduced ? {} : item} className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight">History</h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-0.5">{history.length} prediction{history.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={handleClear} className="btn-secondary !text-[var(--severity-critical)] !border-[var(--severity-critical)]/30 hover:!bg-[var(--severity-critical)]/10 !gap-1.5">
          <IconTrash size={13} /> Clear all
        </button>
      </motion.div>

      {/* Table */}
      <motion.div variants={reduced ? {} : item}
        className="surface border border-[var(--border-subtle)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--bg-elevated-2)] scrollbar-track-transparent">
          <table className="w-full min-w-[760px] relative border-collapse">
            <thead className="sticky top-0 bg-[var(--bg-elevated-1)] z-10 shadow-sm border-b border-[var(--border-subtle)]">
              <tr>
                {["Time", "Event Cause", "Type", "Location", "Corridor", "Severity", "Confidence", "Officers", "Report"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)] font-medium bg-[var(--bg-elevated-1)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {history.map((e, idx) => (
                <tr key={e.id} className={`${idx % 2 === 0 ? 'bg-[var(--bg-base)]' : 'bg-[var(--bg-elevated-1)]'} hover:bg-[var(--bg-elevated-2)] transition-colors group`}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-data text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{new Date(e.timestamp).toLocaleDateString()}</p>
                    <p className="font-data text-[10px] text-[var(--text-tertiary)] mt-0.5">{new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-primary)] font-medium capitalize whitespace-nowrap">{e.input.event_cause.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-xs text-[var(--text-secondary)] capitalize whitespace-nowrap">{e.input.event_type}</td>
                  <td className="px-4 py-3 font-data text-[11px] text-[var(--text-secondary)] whitespace-nowrap">
                    {e.input.latitude.toFixed(4)}, {e.input.longitude.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-secondary)] whitespace-nowrap">{e.input.corridor ?? <span className="text-[var(--text-tertiary)]">—</span>}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><SeverityBadge label={e.severity_label} size="sm" /></td>
                  <td className="px-4 py-3 font-data text-xs text-[var(--text-secondary)] tabular-nums whitespace-nowrap">{(e.confidence * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 font-data text-xs text-[var(--text-secondary)] tabular-nums whitespace-nowrap">{e.recommendations.manpower_min}–{e.recommendations.manpower_max}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => downloadReport(e)}
                      aria-label={`Download report for ${e.input.event_cause.replace(/_/g, " ")} on ${new Date(e.timestamp).toLocaleDateString()}`}
                      title="Download report as PDF"
                      className="btn-ghost !p-1.5 rounded text-[var(--text-tertiary)] hover:text-[var(--accent-signal)] hover:bg-[var(--bg-elevated-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-signal)]"
                    >
                      <IconFileDownload size={14} stroke={1.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
