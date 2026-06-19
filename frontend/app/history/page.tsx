"use client"
import { useEffect, useState } from "react"
import { HistoryEntry } from "@/types"
import { getHistory, clearHistory } from "@/lib/history"
import SeverityBadge from "@/components/shared/SeverityBadge"
import { Trash2 } from "lucide-react"
import Link from "next/link"

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  useEffect(() => { setHistory(getHistory()) }, [])
  const handleClear = () => { clearHistory(); setHistory([]) }

  if (history.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="surface rounded px-6 py-16 text-center anim-in">
          <p className="text-xs font-medium text-[#a1a1aa] mb-1">No history</p>
          <p className="text-[11px] text-[#3f3f46] mb-4">Predictions will appear here after you run them.</p>
          <Link href="/predict" className="text-xs text-orange-500 hover:text-orange-400 transition-colors">
            Run first prediction →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 anim-in">
        <div>
          <h1 className="text-base font-semibold text-[#e4e4e7]">History</h1>
          <p className="text-xs text-[#52525b] mt-0.5">{history.length} predictions</p>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-[11px] text-[#52525b] hover:text-[#f87171] border border-[#1c1c21] hover:border-[#2a1515] px-3 py-1.5 rounded transition-colors"
        >
          <Trash2 size={11} /> Clear all
        </button>
      </div>

      {/* Table */}
      <div className="surface rounded overflow-hidden anim-in delay-1">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-[#1c1c21] bg-[#0f0f12]">
                {["Time", "Event Cause", "Type", "Location", "Corridor", "Severity", "Confidence", "Officers"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] text-[#52525b] uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c1c21]">
              {history.map(e => (
                <tr key={e.id} className="hover:bg-[#0f0f12] transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-[11px] text-[#71717a]">{new Date(e.timestamp).toLocaleDateString()}</span>
                    <br />
                    <span className="text-[10px] text-[#3f3f46]">{new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#e4e4e7] font-medium capitalize">{e.input.event_cause.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-xs text-[#71717a] capitalize">{e.input.event_type}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-[#52525b]">
                    {e.input.latitude.toFixed(4)}, {e.input.longitude.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#71717a]">{e.input.corridor ?? <span className="text-[#2a2a32]">—</span>}</td>
                  <td className="px-4 py-3"><SeverityBadge label={e.severity_label} size="sm" /></td>
                  <td className="px-4 py-3 text-xs text-[#a1a1aa] tabular-nums font-medium">{(e.confidence * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-xs text-[#a1a1aa] tabular-nums">{e.recommendations.manpower_min}–{e.recommendations.manpower_max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
