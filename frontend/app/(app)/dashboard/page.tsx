"use client"
import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import dynamic from "next/dynamic"
import { HistoryEntry } from "@/types"
import { getHistory } from "@/lib/history"
import { SEVERITY_COLORS } from "@/lib/severity"
import SeverityBadge from "@/components/shared/SeverityBadge"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import Link from "next/link"
import {
  IconArrowRight,
  IconAlertTriangle,
  IconChartPie,
  IconMapPin,
  IconClockHour4,
  IconBolt,
} from "@tabler/icons-react"
import { pageContainer as container, fadeUp as item, gridItem } from "@/lib/motion"

const BengaluruMap = dynamic(() => import("@/components/map/BengaluruMap"), { ssr: false })


export default function Dashboard() {
  const reduced = useReducedMotion()
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
    { label: "Total Predictions", value: history.length,                                        icon: IconBolt },
    { label: "Critical",          value: history.filter(h => h.severity_level === 3).length,    icon: IconAlertTriangle },
    { label: "High Severity",     value: history.filter(h => h.severity_level === 2).length,    icon: IconChartPie },
    { label: "Avg Confidence",    value: avgConf ? `${avgConf}%` : "—",                        icon: IconClockHour4 },
  ]

  return (
    <motion.div
      variants={reduced ? {} : container}
      initial="hidden"
      animate="show"
      className="px-6 py-6 max-w-7xl mx-auto space-y-6 pb-6"
    >
      {/* Page title */}
      <motion.div variants={reduced ? {} : item}>
        <h1 className="text-xl font-medium text-zinc-50">Dashboard</h1>
        <p className="text-sm text-zinc-400 leading-relaxed mt-0.5">Bengaluru congestion monitoring</p>
      </motion.div>

      {/* Stat row */}
      <motion.div variants={reduced ? {} : item}
        className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#1c1c21] border border-[#1c1c21] rounded-lg overflow-hidden">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-[#09090b] p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-zinc-500">{label}</p>
              <Icon size={14} stroke={1.5} className="text-zinc-600" />
            </div>
            <p className="text-2xl font-medium text-zinc-50 tabular-nums">{value}</p>
          </div>
        ))}
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <motion.div variants={reduced ? {} : item}
          className="lg:col-span-2 bg-[#0f0f12] border border-[#1c1c21] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1c1c21] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconMapPin size={13} stroke={1.5} className="text-zinc-500" />
              <span className="text-xs text-zinc-400">Incident Map</span>
            </div>
            <span className="text-xs uppercase tracking-widest text-zinc-600">Bengaluru</span>
          </div>
          <div className="p-3">
            <BengaluruMap entries={history} height="370px" />
          </div>
        </motion.div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Severity split */}
          <motion.div variants={reduced ? {} : item}
            className="bg-[#0f0f12] border border-[#1c1c21] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1c1c21] flex items-center gap-2">
              <IconChartPie size={13} stroke={1.5} className="text-zinc-500" />
              <span className="text-xs text-zinc-400">Severity Distribution</span>
            </div>
            <div className="p-4">
              {sevCounts.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={sevCounts} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" paddingAngle={3}>
                        {sevCounts.map((d, i) => <Cell key={i} fill={d.fill} stroke="transparent" />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#0f0f12", border: "1px solid #1c1c21", borderRadius: 6, fontSize: 11 }} itemStyle={{ color: "#a1a1aa" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    {sevCounts.map(d => (
                      <div key={d.name} className="flex items-center justify-between py-1">
                        <SeverityBadge label={d.name} size="sm" />
                        <span className="text-xs text-zinc-400 tabular-nums font-medium">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <IconChartPie size={28} stroke={1} className="text-zinc-700" />
                  <p className="text-xs text-zinc-500">No data yet</p>
                  <p className="text-xs text-zinc-600">Predictions will appear here after you run them</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent events */}
          <motion.div variants={reduced ? {} : item}
            className="bg-[#0f0f12] border border-[#1c1c21] rounded-lg overflow-hidden flex-1">
            <div className="px-4 py-3 border-b border-[#1c1c21] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconClockHour4 size={13} stroke={1.5} className="text-zinc-500" />
                <span className="text-xs text-zinc-400">Recent Events</span>
              </div>
              <Link href="/history" className="btn-ghost !py-0.5 !px-2 !text-[11px] !gap-1">
                All <IconArrowRight size={11} />
              </Link>
            </div>
            <div className="divide-y divide-[#1c1c21]">
              {recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-10 gap-2">
                  <IconClockHour4 size={28} stroke={1} className="text-zinc-700" />
                  <p className="text-xs text-zinc-500">No data yet</p>
                  <p className="text-xs text-zinc-600">Predictions will appear here after you run them</p>
                  <Link href="/predict" className="text-xs text-orange-500 hover:text-orange-400 transition-colors mt-1">
                    Run first prediction →
                  </Link>
                </div>
              ) : (
                recent.map(e => (
                  <div key={e.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-[#141417] transition-colors">
                    <div>
                      <p className="text-xs font-medium text-zinc-50 capitalize">{e.input.event_cause.replace(/_/g, " ")}</p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">{new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <SeverityBadge label={e.severity_label} size="sm" />
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Empty CTA */}
      {history.length === 0 && (
        <motion.div variants={reduced ? {} : item} className="text-center pt-2">
          <Link href="/predict" className="btn-primary">
            Run First Prediction <IconArrowRight size={14} />
          </Link>
        </motion.div>
      )}
    </motion.div>
  )
}
