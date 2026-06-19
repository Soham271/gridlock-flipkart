"use client"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { HistoryEntry } from "@/types"
import { getHistory } from "@/lib/history"
import { SEVERITY_COLORS } from "@/lib/severity"
import SeverityBadge from "@/components/shared/SeverityBadge"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const BengaluruMap = dynamic(() => import("@/components/map/BengaluruMap"), { ssr: false })

export default function Dashboard() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  useEffect(() => { setHistory(getHistory()) }, [])

  const recent = history.slice(0, 6)
  const sevCounts = ["Low", "Medium", "High", "Critical"].map(label => ({
    name: label,
    value: history.filter(h => h.severity_label === label).length,
    fill: SEVERITY_COLORS[label],
  })).filter(d => d.value > 0)

  const avgConf = history.length
    ? (history.reduce((s, h) => s + h.confidence, 0) / history.length * 100).toFixed(1)
    : null

  const stats = [
    { label: "Total Predictions", value: history.length },
    { label: "Critical",          value: history.filter(h => h.severity_level === 3).length },
    { label: "High Severity",     value: history.filter(h => h.severity_level === 2).length },
    { label: "Avg Confidence",    value: avgConf ? `${avgConf}%` : "—" },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page title */}
      <div className="mb-6 anim-in">
        <h1 className="text-base font-semibold text-[#e4e4e7]">Dashboard</h1>
        <p className="text-xs text-[#52525b] mt-0.5">Bengaluru congestion monitoring</p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#1c1c21] border border-[#1c1c21] rounded mb-6 overflow-hidden anim-in delay-1">
        {stats.map(s => (
          <div key={s.label} className="bg-[#09090b] px-5 py-4">
            <p className="text-[11px] text-[#52525b] uppercase tracking-wider mb-1.5">{s.label}</p>
            <p className="text-2xl font-semibold text-[#e4e4e7] tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2 surface rounded anim-in delay-2">
          <div className="px-4 py-3 border-b border-[#1c1c21] flex items-center justify-between">
            <span className="text-xs font-medium text-[#a1a1aa]">Incident Map</span>
            <span className="text-[10px] text-[#3f3f46] uppercase tracking-wider">Bengaluru</span>
          </div>
          <div className="p-3">
            <BengaluruMap entries={history} height="370px" />
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Severity split */}
          <div className="surface rounded anim-in delay-3">
            <div className="px-4 py-3 border-b border-[#1c1c21]">
              <span className="text-xs font-medium text-[#a1a1aa]">Severity Distribution</span>
            </div>
            <div className="p-4">
              {sevCounts.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={sevCounts} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" paddingAngle={3}>
                        {sevCounts.map((d, i) => <Cell key={i} fill={d.fill} stroke="transparent" />)}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "#0f0f12", border: "1px solid #1c1c21", borderRadius: 4, fontSize: 11 }}
                        itemStyle={{ color: "#a1a1aa" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    {sevCounts.map(d => (
                      <div key={d.name} className="flex items-center justify-between text-[11px] py-1">
                        <SeverityBadge label={d.name} size="sm" />
                        <span className="text-[#a1a1aa] tabular-nums font-medium">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-[#3f3f46] text-xs text-center py-10">No data</div>
              )}
            </div>
          </div>

          {/* Recent events */}
          <div className="surface rounded flex-1 anim-in delay-4">
            <div className="px-4 py-3 border-b border-[#1c1c21] flex items-center justify-between">
              <span className="text-xs font-medium text-[#a1a1aa]">Recent Events</span>
              <Link href="/history" className="text-[10px] text-[#52525b] hover:text-[#a1a1aa] flex items-center gap-1 transition-colors uppercase tracking-wider">
                All <ArrowRight size={9} />
              </Link>
            </div>
            <div className="divide-y divide-[#1c1c21]">
              {recent.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-[#3f3f46] text-xs mb-3">No predictions yet</p>
                  <Link href="/predict" className="text-xs text-orange-500 hover:text-orange-400 transition-colors">
                    Run first prediction →
                  </Link>
                </div>
              ) : (
                recent.map(e => (
                  <div key={e.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-[#0f0f12] transition-colors">
                    <div>
                      <p className="text-xs font-medium text-[#e4e4e7] capitalize">{e.input.event_cause.replace(/_/g, " ")}</p>
                      <p className="text-[10px] text-[#3f3f46] mt-0.5">{new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <SeverityBadge label={e.severity_label} size="sm" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Empty CTA */}
      {history.length === 0 && (
        <div className="mt-8 text-center anim-in">
          <Link
            href="/predict"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            Run First Prediction <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  )
}
