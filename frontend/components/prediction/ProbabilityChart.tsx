"use client"
import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { SEVERITY_COLORS } from "@/lib/severity"

export default function ProbabilityChart({ probs }: { probs: Record<string, number> }) {
  const data = Object.entries(probs).map(([name, value]) => ({
    name,
    value: parseFloat((value * 100).toFixed(1)),
    fill: SEVERITY_COLORS[name] ?? "#52525b",
  }))

  return (
    <div className="surface rounded anim-in">
      <div className="px-4 py-3 border-b border-[#1c1c21]">
        <span className="text-xs font-medium text-[#a1a1aa]">Class Probabilities</span>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} margin={{ top: 10, right: 4, left: -22, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: "#52525b", fontSize: 10 }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fill: "#52525b", fontSize: 9 }}
              axisLine={false} tickLine={false}
              domain={[0, 100]} unit="%"
            />
            <Tooltip
              contentStyle={{ background: "#0f0f12", border: "1px solid #1c1c21", borderRadius: 4, fontSize: 11 }}
              labelStyle={{ color: "#a1a1aa" }}
              itemStyle={{ color: "#e4e4e7" }}
              formatter={(v: any) => [`${v}%`, "Probability"]}
              cursor={{ fill: "rgba(255,255,255,0.02)" }}
            />
            <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={36}>
              {data.map((d, i) => <Cell key={i} fill={d.fill} fillOpacity={0.75} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
