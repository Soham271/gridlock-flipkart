"use client"
import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { SEVERITY_COLORS } from "@/lib/severity"

export default function ProbabilityChart({ probs }: { probs: Record<string, number> }) {
  const data = Object.entries(probs).map(([name, value]) => ({
    name,
    value: parseFloat((value * 100).toFixed(1)),
    fill: SEVERITY_COLORS[name] ?? "#888",
  }))

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-white font-semibold mb-4">Class Probabilities</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
          <Tooltip
            contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
            labelStyle={{ color: "#fff" }}
            formatter={(v: any) => [`${v}%`, "Probability"]}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
