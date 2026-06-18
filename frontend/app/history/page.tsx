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

  const handleClear = () => {
    clearHistory()
    setHistory([])
  }

  if (history.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center pt-20">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-gray-400 text-lg">No prediction history yet.</p>
        <Link href="/predict" className="inline-block mt-4 bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg">
          Make a Prediction
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Prediction History</h1>
          <p className="text-gray-400 text-sm">{history.length} predictions stored locally</p>
        </div>
        <button onClick={handleClear}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm border border-red-800 hover:border-red-600 px-3 py-1.5 rounded-lg transition-colors">
          <Trash2 size={13} /> Clear All
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              {["Time", "Event Cause", "Type", "Location", "Corridor", "Severity", "Confidence", "Officers"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-gray-400 text-xs uppercase tracking-wide font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((e, i) => (
              <tr key={e.id} className={`border-b border-gray-700 hover:bg-gray-750 ${i % 2 === 0 ? "bg-gray-800" : "bg-gray-850"}`}>
                <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                  {new Date(e.timestamp).toLocaleDateString()}<br />
                  <span className="text-gray-500 text-xs">{new Date(e.timestamp).toLocaleTimeString()}</span>
                </td>
                <td className="px-4 py-3 text-white capitalize">{e.input.event_cause.replace(/_/g, " ")}</td>
                <td className="px-4 py-3 text-gray-300 capitalize">{e.input.event_type}</td>
                <td className="px-4 py-3 text-gray-300 font-mono text-xs">
                  {e.input.latitude.toFixed(4)}, {e.input.longitude.toFixed(4)}
                </td>
                <td className="px-4 py-3 text-gray-300">{e.input.corridor ?? "—"}</td>
                <td className="px-4 py-3"><SeverityBadge label={e.severity_label} size="sm" /></td>
                <td className="px-4 py-3 text-white font-semibold">{(e.confidence * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 text-white">{e.recommendations.manpower_min}–{e.recommendations.manpower_max}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
