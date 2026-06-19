import { PredictRequest } from "@/types"
import { Zap } from "lucide-react"

interface Demo {
  label: string
  tag: string
  tagColor: string
  description: string
  preset: PredictRequest
}

const DEMOS: Demo[] = [
  {
    label: "Cricket at Chinnaswamy",
    tag: "Critical",
    tagColor: "text-[#f87171]",
    description: "IPL match, 6 PM Friday, MG Road corridor",
    preset: {
      latitude: 12.9788,
      longitude: 77.5996,
      event_type: "planned",
      event_cause: "public_event",
      start_hour: 18,
      day_of_week: 4,
      month: 6,
      day: 20,
      corridor: "MG Road",
      zone: "CBD 1",
      police_station: "Cubbon Park",
      duration_mins: 240,
      veh_type: undefined,
    },
  },
  {
    label: "Breakdown on Outer Ring Road",
    tag: "High",
    tagColor: "text-[#fb923c]",
    description: "Heavy vehicle, 9 AM Monday, ORR East",
    preset: {
      latitude: 12.9352,
      longitude: 77.6245,
      event_type: "unplanned",
      event_cause: "vehicle_breakdown",
      start_hour: 9,
      day_of_week: 0,
      month: 6,
      day: 16,
      corridor: "ORR East 1",
      zone: "East",
      police_station: "Marathahalli",
      duration_mins: 90,
      veh_type: "heavy",
    },
  },
  {
    label: "Procession in CBD",
    tag: "Medium",
    tagColor: "text-[#facc15]",
    description: "Religious procession, 2 PM Sunday",
    preset: {
      latitude: 12.9762,
      longitude: 77.5929,
      event_type: "planned",
      event_cause: "procession",
      start_hour: 14,
      day_of_week: 6,
      month: 6,
      day: 22,
      corridor: undefined,
      zone: "CBD 2",
      police_station: "Indiranagar",
      duration_mins: 120,
      veh_type: undefined,
    },
  },
  {
    label: "Road Work — Off Peak",
    tag: "Low",
    tagColor: "text-[#4ade80]",
    description: "Scheduled repair, 2 AM, industrial area",
    preset: {
      latitude: 12.9236,
      longitude: 77.5921,
      event_type: "planned",
      event_cause: "road_work",
      start_hour: 2,
      day_of_week: 2,
      month: 6,
      day: 18,
      corridor: undefined,
      zone: "South",
      police_station: "JP Nagar",
      duration_mins: 180,
      veh_type: undefined,
    },
  },
]

interface Props {
  onLoad: (preset: PredictRequest) => void
}

export default function DemoScenarios({ onLoad }: Props) {
  return (
    <div className="surface rounded overflow-hidden">
      <div className="px-4 py-3 border-b border-[#1c1c21] flex items-center gap-2">
        <Zap size={12} className="text-orange-500" strokeWidth={1.5} />
        <span className="text-xs font-medium text-[#a1a1aa]">Demo Scenarios</span>
        <span className="text-[10px] text-[#3f3f46] ml-1">— click to load</span>
      </div>
      <div className="divide-y divide-[#1c1c21]">
        {DEMOS.map(d => (
          <button
            key={d.label}
            onClick={() => onLoad(d.preset)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#0f0f12] transition-colors text-left group"
          >
            <div>
              <p className="text-xs font-medium text-[#e4e4e7] group-hover:text-white transition-colors">{d.label}</p>
              <p className="text-[10px] text-[#3f3f46] mt-0.5">{d.description}</p>
            </div>
            <span className={`text-[11px] font-medium ${d.tagColor} shrink-0 ml-3`}>{d.tag}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
