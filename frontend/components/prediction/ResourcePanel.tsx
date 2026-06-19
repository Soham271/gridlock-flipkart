import { Recommendations } from "@/types"
import { Users, Navigation, Clock, AlertTriangle, Zap, Shield } from "lucide-react"

const Row = ({ label, value, icon: Icon }: { label: string; value: string; icon: any }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-[#1c1c21] last:border-0">
    <div className="flex items-center gap-2 text-[#52525b]">
      <Icon size={12} strokeWidth={1.5} />
      <span className="text-[11px] uppercase tracking-wider">{label}</span>
    </div>
    <span className="text-xs text-[#a1a1aa] font-medium text-right max-w-[55%]">{value}</span>
  </div>
)

export default function ResourcePanel({ rec }: { rec: Recommendations }) {
  return (
    <div className="surface rounded anim-in">
      <div className="px-4 py-3 border-b border-[#1c1c21]">
        <span className="text-xs font-medium text-[#a1a1aa]">Deployment Recommendations</span>
      </div>
      <div className="px-4 pt-1 pb-2">
        <Row icon={Users}      label="Manpower"    value={`${rec.manpower_min}–${rec.manpower_max} officers`} />
        <Row icon={Clock}      label="Est. Delay"  value={`~${rec.impact_minutes} min`} />
        <Row icon={Shield}     label="Barricading" value={rec.barricading} />
        <Row icon={Navigation} label="Diversion"   value={rec.diversion} />
      </div>

      {(rec.pre_deploy || rec.peak_note || rec.special_action) && (
        <div className="border-t border-[#1c1c21] px-4 py-3 space-y-2">
          {rec.pre_deploy && (
            <div className="flex gap-2.5 items-start">
              <Zap size={11} className="text-[#60a5fa] mt-0.5 shrink-0" strokeWidth={1.5} />
              <p className="text-[11px] text-[#71717a] leading-relaxed">{rec.pre_deploy}</p>
            </div>
          )}
          {rec.peak_note && (
            <div className="flex gap-2.5 items-start">
              <AlertTriangle size={11} className="text-[#fbbf24] mt-0.5 shrink-0" strokeWidth={1.5} />
              <p className="text-[11px] text-[#71717a] leading-relaxed">{rec.peak_note}</p>
            </div>
          )}
          {rec.special_action && (
            <div className="flex gap-2.5 items-start">
              <AlertTriangle size={11} className="text-[#f87171] mt-0.5 shrink-0" strokeWidth={1.5} />
              <p className="text-[11px] text-[#71717a] leading-relaxed">{rec.special_action}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
