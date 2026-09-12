import type { ComponentType } from "react"
import { Recommendations } from "@/types"
import { Users, Navigation, Clock, AlertTriangle, Zap, Shield } from "lucide-react"

type IconComponent = ComponentType<{ size?: number; strokeWidth?: number }>

const Row = ({ label, value, icon: Icon }: { label: string; value: string; icon: IconComponent }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-[var(--border-subtle)] last:border-0">
    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
      <Icon size={12} strokeWidth={1.5} />
      <span className="text-[10px] uppercase tracking-[0.08em]">{label}</span>
    </div>
    <span className="font-data text-xs text-[var(--text-primary)] font-medium text-right max-w-[55%]">{value}</span>
  </div>
)

export default function ResourcePanel({ rec }: { rec: Recommendations }) {
  return (
    <div className="surface rounded-lg anim-in overflow-hidden border border-[var(--border-subtle)]">
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated-1)]">
        <span className="text-xs font-medium text-[var(--text-secondary)]">Deployment Recommendations</span>
      </div>
      <div className="px-4 pt-1 pb-2">
        <Row icon={Users}      label="Manpower"    value={`${rec.manpower_min}–${rec.manpower_max} officers`} />
        <Row icon={Clock}      label="Est. Delay"  value={`~${rec.impact_minutes} min`} />
        <Row icon={Shield}     label="Barricading" value={rec.barricading} />
        <Row icon={Navigation} label="Diversion"   value={rec.diversion} />
      </div>

      {(rec.pre_deploy || rec.peak_note || rec.special_action) && (
        <div className="border-t border-[var(--border-subtle)] px-4 py-3 space-y-2 bg-[var(--bg-elevated-1)]/50">
          {rec.pre_deploy && (
            <div className="flex gap-2.5 items-start">
              <Zap size={11} className="text-[var(--accent-signal)] mt-0.5 shrink-0" strokeWidth={1.5} />
              <p className="font-data text-[11px] text-[var(--text-secondary)] leading-relaxed">{rec.pre_deploy}</p>
            </div>
          )}
          {rec.peak_note && (
            <div className="flex gap-2.5 items-start">
              <AlertTriangle size={11} className="text-[var(--severity-medium)] mt-0.5 shrink-0" strokeWidth={1.5} />
              <p className="font-data text-[11px] text-[var(--text-secondary)] leading-relaxed">{rec.peak_note}</p>
            </div>
          )}
          {rec.special_action && (
            <div className="flex gap-2.5 items-start">
              <AlertTriangle size={11} className="text-[var(--severity-critical)] mt-0.5 shrink-0" strokeWidth={1.5} />
              <p className="font-data text-[11px] text-[var(--text-secondary)] leading-relaxed">{rec.special_action}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
