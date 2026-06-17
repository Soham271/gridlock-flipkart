import { PredictResponse } from "@/types"
import { SEVERITY_TEXT, SEVERITY_BORDER, SEVERITY_EMOJI } from "@/lib/severity"

export default function SeverityCard({ result }: { result: PredictResponse }) {
  const { severity_label, severity_level, confidence, recommendations } = result
  const textClass = SEVERITY_TEXT[severity_label] ?? "text-gray-400"
  const borderClass = SEVERITY_BORDER[severity_label] ?? "border-gray-500"

  return (
    <div className={`bg-gray-800 rounded-xl border-2 ${borderClass} p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">Congestion Severity</p>
          <div className={`text-5xl font-black ${textClass} flex items-center gap-3`}>
            <span>{SEVERITY_EMOJI[severity_label]}</span>
            <span>{severity_label.toUpperCase()}</span>
          </div>
          <p className="text-gray-400 text-sm mt-1">Level {severity_level} of 3</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm mb-1">Model Confidence</p>
          <p className={`text-4xl font-bold ${textClass}`}>{(confidence * 100).toFixed(1)}%</p>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{
            width: `${confidence * 100}%`,
            backgroundColor: { Low: "#2ecc71", Medium: "#f39c12", High: "#e67e22", Critical: "#e74c3c" }[severity_label] ?? "#888"
          }}
        />
      </div>

      {/* Quick recommendation chips */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-gray-700 rounded-lg p-3">
          <p className="text-gray-400 text-xs uppercase mb-1">Officers Required</p>
          <p className="text-white font-bold text-lg">{recommendations.manpower_min}–{recommendations.manpower_max}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <p className="text-gray-400 text-xs uppercase mb-1">Est. Delay</p>
          <p className="text-white font-bold text-lg">~{recommendations.impact_minutes} min</p>
        </div>
      </div>
    </div>
  )
}
