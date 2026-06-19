"use client"
import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { HistoryEntry } from "@/types"
import { getHistory, clearHistory } from "@/lib/history"
import SeverityBadge from "@/components/shared/SeverityBadge"
import Link from "next/link"
import {
  IconTrash,
  IconHistory,
  IconScanEye,
} from "@tabler/icons-react"
import { pageContainer as container, fadeUp as item } from "@/lib/motion"

export default function HistoryPage() {
  const reduced  = useReducedMotion()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  useEffect(() => { setHistory(getHistory()) }, [])

  const handleClear = () => { clearHistory(); setHistory([]) }

  if (history.length === 0) {
    return (
      <motion.div
        variants={reduced ? {} : container}
        initial="hidden"
        animate="show"
        className="px-6 py-6 max-w-7xl mx-auto"
      >
        <motion.div variants={reduced ? {} : item}>
          <h1 className="text-xl font-medium text-zinc-50 mb-6">History</h1>
        </motion.div>
        <motion.div variants={reduced ? {} : item}
          className="bg-[#0f0f12] border border-[#1c1c21] rounded-lg flex flex-col items-center justify-center px-6 py-20 gap-3 text-center">
          <IconHistory size={36} stroke={1} className="text-zinc-700" />
          <p className="text-sm text-zinc-400">No data yet</p>
          <p className="text-xs text-zinc-600">Predictions will appear here after you run them</p>
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
          <h1 className="text-xl font-medium text-zinc-50">History</h1>
          <p className="text-sm text-zinc-400 leading-relaxed mt-0.5">{history.length} prediction{history.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={handleClear} className="btn-secondary !text-red-400 !border-[#2a1515] hover:!border-red-900 hover:!bg-[#1a0d0d] !gap-1.5">
          <IconTrash size={13} /> Clear all
        </button>
      </motion.div>

      {/* Table */}
      <motion.div variants={reduced ? {} : item}
        className="bg-[#0f0f12] border border-[#1c1c21] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-[#1c1c21]">
                {["Time", "Event Cause", "Type", "Location", "Corridor", "Severity", "Confidence", "Officers"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-widest text-zinc-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c1c21]">
              {history.map(e => (
                <tr key={e.id} className="hover:bg-[#141417] transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-xs text-zinc-400">{new Date(e.timestamp).toLocaleDateString()}</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">{new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-50 font-medium capitalize">{e.input.event_cause.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-xs text-zinc-400 capitalize">{e.input.event_type}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">
                    {e.input.latitude.toFixed(4)}, {e.input.longitude.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">{e.input.corridor ?? <span className="text-zinc-700">—</span>}</td>
                  <td className="px-4 py-3"><SeverityBadge label={e.severity_label} size="sm" /></td>
                  <td className="px-4 py-3 text-xs text-zinc-400 tabular-nums">{(e.confidence * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-xs text-zinc-400 tabular-nums">{e.recommendations.manpower_min}–{e.recommendations.manpower_max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
