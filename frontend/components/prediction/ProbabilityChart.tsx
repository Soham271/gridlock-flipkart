"use client"
import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { SEVERITY_COLORS } from "@/lib/severity"

export default function ProbabilityChart({ probs }: { probs: Record<string, number> }) {
  const data = Object.entries(probs).map(([name, value]) => ({
    name,
    value: parseFloat((value * 100).toFixed(1)),
    fill: SEVERITY_COLORS[name] ?? "var(--border-strong)",
  }))

  return (
    <div className="surface rounded-lg anim-in overflow-hidden border border-[var(--border-subtle)] h-full flex flex-col">
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated-1)] shrink-0">
        <span className="text-xs font-medium text-[var(--text-secondary)]">Class Probabilities</span>
      </div>
      <div className="p-4 flex-1">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} margin={{ top: 10, right: 4, left: -22, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--text-secondary)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--text-tertiary)", fontSize: 9, fontFamily: "var(--font-mono)" }}
              axisLine={false} tickLine={false}
              domain={[0, 100]} unit="%"
            />
            <Tooltip
              contentStyle={{ background: "var(--bg-elevated-2)", border: "1px solid var(--border-subtle)", borderRadius: 4, fontSize: 11, fontFamily: "var(--font-mono)" }}
              labelStyle={{ color: "var(--text-secondary)" }}
              itemStyle={{ color: "var(--text-primary)" }}
              formatter={v => [`${v}%`, "Probability"]}
              cursor={{ fill: "var(--bg-elevated-1)" }}
            />
            <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={36}>
              {data.map((d, i) => <Cell key={i} fill={d.fill} fillOpacity={0.85} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
