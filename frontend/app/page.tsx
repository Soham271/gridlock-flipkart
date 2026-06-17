"use client"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { HistoryEntry } from "@/types"
import { getHistory } from "@/lib/history"
import { SEVERITY_COLORS, SEVERITY_EMOJI } from "@/lib/severity"
import SeverityBadge from "@/components/shared/SeverityBadge"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const BengaluruMap = dynamic(() => import("@/components/map/BengaluruMap"), { ssr: false })

export default function Dashboard() {
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => { setHistory(getHistory()) }, [])

  const recent = history.slice(0, 5)

  const sevCounts = ["Low", "Medium", "High", "Critical"].map(label => ({
    name: label,
    value: history.filter(h => h.severity_label === label).length,
    fill: SEVERITY_COLORS[label],
  })).filter(d => d.value > 0)

  const avgConf = history.length
    ? (history.reduce((s, h) => s + h.confidence, 0) / history.length * 100).toFixed(1)
    : "—"

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Traffic Intelligence Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Bengaluru Event-Driven Congestion Monitor</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Predictions", value: history.length.toString() },
          { label: "Critical Events",   value: history.filter(h => h.severity_level === 3).length.toString() },
          { label: "High Severity",     value: history.filter(h => h.severity_level === 2).length.toString() },
          { label: "Avg Confidence",    value: `${avgConf}%` },
        ].map(s => (
          <div key={s.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-xs uppercase tracking-wide">{s.label}</p>
            <p className="text-white text-3xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Map */}
        <div className="col-span-2">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h2 className="text-white font-semibold mb-3">Incident Map — Bengaluru</h2>
            <BengaluruMap entries={history} height="380px" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h2 className="text-white font-semibold mb-2">Severity Split</h2>
            {sevCounts.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={sevCounts} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {sevCounts.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151" }}
                    formatter={(v: any, n: any) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-500 text-sm text-center py-8">No data yet</div>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {sevCounts.map(d => (
                <span key={d.name} className="text-xs text-gray-300 flex items-center gap-1">
                  <span style={{ color: d.fill }}>{SEVERITY_EMOJI[d.name]}</span> {d.name}: {d.value}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold">Recent Events</h2>
              <Link href="/history" className="text-orange-400 text-xs flex items-center gap-1 hover:text-orange-300">
                View all <ArrowRight size={11} />
              </Link>
            </div>
            {recent.length === 0 ? (
              <div className="text-gray-500 text-sm">
                No predictions yet.{" "}
                <Link href="/predict" className="text-orange-400 hover:underline">Make your first one →</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recent.map(e => (
                  <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-gray-700 last:border-0">
                    <div>
                      <p className="text-white text-sm font-medium">{e.input.event_cause.replace(/_/g, " ")}</p>
                      <p className="text-gray-500 text-xs">{new Date(e.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <SeverityBadge label={e.severity_label} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {history.length === 0 && (
        <div className="mt-8 text-center">
          <Link href="/predict"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            Predict Your First Event <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  )
}
