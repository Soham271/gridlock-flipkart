"use client"
import { useEffect, useState } from "react"
import { PredictResponse } from "@/types"

const SEV_COLOR: Record<string, string> = {
  Low:      "#4ade80",
  Medium:   "#facc15",
  High:     "#fb923c",
  Critical: "#f87171",
}

const SEV_TEXT: Record<string, string> = {
  Low:      "text-[#4ade80]",
  Medium:   "text-[#facc15]",
  High:     "text-[#fb923c]",
  Critical: "text-[#f87171]",
}

const SEV_BORDER: Record<string, string> = {
  Low:      "border-l-[#4ade80]",
  Medium:   "border-l-[#facc15]",
  High:     "border-l-[#fb923c]",
  Critical: "border-l-[#f87171]",
}

export default function SeverityCard({ result }: { result: PredictResponse }) {
  const { severity_label, severity_level, confidence, recommendations } = result
  const [bar, setBar] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setBar(confidence * 100), 80)
    return () => clearTimeout(t)
  }, [confidence])

  return (
    <div className={`surface rounded border-l-2 ${SEV_BORDER[severity_label] ?? "border-l-[#3f3f46]"} anim-in`}>
      {/* Header row */}
      <div className="px-5 py-4 flex items-start justify-between border-b border-[#1c1c21]">
        <div>
          <p className="text-[10px] text-[#52525b] uppercase tracking-wider mb-2">Congestion Severity</p>
          <div className="flex items-baseline gap-2.5">
            <span className={`text-3xl font-bold tracking-tight ${SEV_TEXT[severity_label]}`}>
              {severity_label.toUpperCase()}
            </span>
            <span className="text-xs text-[#52525b]">Level {severity_level} / 3</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-[#52525b] uppercase tracking-wider mb-2">Confidence</p>
          <span className={`text-2xl font-bold tabular-nums ${SEV_TEXT[severity_label]}`}>
            {(confidence * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="px-5 pt-3.5 pb-1">
        <div className="w-full bg-[#141418] rounded-full h-[3px] overflow-hidden">
          <div
            className="h-[3px] rounded-full anim-bar"
            style={{ width: `${bar}%`, background: SEV_COLOR[severity_label] ?? "#3f3f46", transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)" }}
          />
        </div>
      </div>

      {/* Key metrics */}
      <div className="px-5 py-4 grid grid-cols-2 gap-3">
        <div className="bg-[#141418] rounded px-4 py-3 border border-[#1c1c21]">
          <p className="text-[10px] text-[#52525b] uppercase tracking-wider mb-1">Officers</p>
          <p className="text-[#e4e4e7] font-semibold text-lg tabular-nums">
            {recommendations.manpower_min}–{recommendations.manpower_max}
          </p>
        </div>
        <div className="bg-[#141418] rounded px-4 py-3 border border-[#1c1c21]">
          <p className="text-[10px] text-[#52525b] uppercase tracking-wider mb-1">Est. Delay</p>
          <p className="text-[#e4e4e7] font-semibold text-lg tabular-nums">
            ~{recommendations.impact_minutes} min
          </p>
        </div>
      </div>
    </div>
  )
}
