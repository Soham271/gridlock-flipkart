import { Recommendations } from "@/types"
import { Users, Shield, Navigation, Clock, AlertTriangle, Zap } from "lucide-react"

const Card = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) => (
  <div className="bg-gray-700 rounded-lg p-4">
    <div className="flex items-center gap-2 text-gray-400 text-xs uppercase mb-2">
      <Icon size={13} />
      {label}
    </div>
    <p className="text-white font-semibold text-sm leading-snug">{value}</p>
    {sub && <p className="text-gray-400 text-xs mt-1">{sub}</p>}
  </div>
)

export default function ResourcePanel({ rec }: { rec: Recommendations }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-white font-semibold mb-4">Deployment Recommendations</h3>
      <div className="grid grid-cols-2 gap-3">
        <Card icon={Users}      label="Manpower"   value={`${rec.manpower_min}–${rec.manpower_max} officers`} />
        <Card icon={Clock}      label="Est. Delay" value={`~${rec.impact_minutes} min`} />
        <Card icon={Shield}     label="Barricading" value={rec.barricading} />
        <Card icon={Navigation} label="Diversion"  value={rec.diversion} />
      </div>

      {rec.pre_deploy && (
        <div className="mt-3 bg-blue-900/40 border border-blue-700 rounded-lg p-3 flex gap-2 items-start">
          <Zap size={14} className="text-blue-400 mt-0.5 shrink-0" />
          <p className="text-blue-300 text-sm">{rec.pre_deploy}</p>
        </div>
      )}
      {rec.peak_note && (
        <div className="mt-3 bg-yellow-900/40 border border-yellow-700 rounded-lg p-3 flex gap-2 items-start">
          <AlertTriangle size={14} className="text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-yellow-300 text-sm">{rec.peak_note}</p>
        </div>
      )}
      {rec.special_action && (
        <div className="mt-3 bg-red-900/40 border border-red-700 rounded-lg p-3 flex gap-2 items-start">
          <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-300 text-sm">{rec.special_action}</p>
        </div>
      )}
    </div>
  )
}
