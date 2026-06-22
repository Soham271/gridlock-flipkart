import { useMemo } from "react"
import { PredictRequest } from "@/types"
import { Users, AlertTriangle, Wrench, HardHat, Flag, MapPin } from "lucide-react"
import { SEVERITY_COLORS } from "@/lib/severity"
import SeverityBadge from "@/components/shared/SeverityBadge"

function getEventIcon(cause: string) {
  switch (cause) {
    case "public_event": return <Users size={16} />
    case "accident": return <AlertTriangle size={16} />
    case "vehicle_breakdown": return <Wrench size={16} />
    case "road_work": return <HardHat size={16} />
    case "procession": return <Flag size={16} />
    default: return <MapPin size={16} />
  }
}

interface Demo {
  label: string
  tag: string
  description: string
  preset: PredictRequest
}

function getNextDate(targetDayOfWeek: number, targetHour: number) {
  const now = new Date()
  const currentDayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1
  let daysToAdd = targetDayOfWeek - currentDayOfWeek
  if (daysToAdd < 0 || (daysToAdd === 0 && now.getHours() >= targetHour)) {
    daysToAdd += 7
  }
  const targetDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000)
  return { month: targetDate.getMonth() + 1, day: targetDate.getDate() }
}

function buildDemos(): Demo[] {
  return [
    {
      label: "Cricket at Chinnaswamy",
      tag: "Critical",
      description: "IPL match, 6 PM Friday, MG Road corridor",
      preset: {
        latitude: 12.9788, longitude: 77.5996,
        event_type: "planned", event_cause: "public_event",
        start_hour: 18, day_of_week: 4, ...getNextDate(4, 18),
        corridor: "MG Road", zone: "CBD 1", police_station: "Cubbon Park",
        duration_mins: 240,
      },
    },
    {
      label: "Breakdown on Outer Ring Road",
      tag: "High",
      description: "Heavy vehicle, 9 AM Monday, ORR East",
      preset: {
        latitude: 12.9352, longitude: 77.6245,
        event_type: "unplanned", event_cause: "vehicle_breakdown",
        start_hour: 9, day_of_week: 0, ...getNextDate(0, 9),
        corridor: "ORR East 1", zone: "East", police_station: "Marathahalli",
        duration_mins: 90, veh_type: "heavy",
      },
    },
    {
      label: "Procession in CBD",
      tag: "Medium",
      description: "Religious procession, 2 PM Sunday",
      preset: {
        latitude: 12.9762, longitude: 77.5929,
        event_type: "planned", event_cause: "procession",
        start_hour: 14, day_of_week: 6, ...getNextDate(6, 14),
        zone: "CBD 2", police_station: "Indiranagar", duration_mins: 120,
      },
    },
    {
      label: "Road Work — Off Peak",
      tag: "Low",
      description: "Scheduled repair, 2 AM, industrial area",
      preset: {
        latitude: 12.9236, longitude: 77.5921,
        event_type: "planned", event_cause: "road_work",
        start_hour: 2, day_of_week: 2, ...getNextDate(2, 2),
        zone: "South", police_station: "JP Nagar", duration_mins: 180,
      },
    },
  ]
}

interface Props {
  onLoad: (preset: PredictRequest, label: string) => void
  activeId?: string | null
}

export default function DemoScenarios({ onLoad, activeId }: Props) {
  const demos = useMemo(() => buildDemos(), [])

  return (
    <div className="surface rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--border-subtle)]">
      {demos.map((d) => {
        const color = SEVERITY_COLORS[d.tag] || "var(--border-subtle)"
        const isActive = activeId === d.label
        return (
          <button
            key={d.label}
            type="button"
            onClick={() => onLoad(d.preset, d.label)}
            className={`w-full relative flex flex-col items-start transition-colors group p-4 text-left
              ${isActive ? "bg-[var(--accent-signal)]/10" : "hover:bg-[var(--bg-elevated-2)]"}`}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ backgroundColor: color, opacity: isActive ? 1 : 0.7 }}
            />
            <div className="w-full flex justify-between items-start mb-2 mt-1">
              <span className="text-xl bg-[var(--bg-base)] w-8 h-8 rounded-full flex items-center justify-center border border-[var(--border-subtle)] shrink-0">
                {getEventIcon(d.preset.event_cause)}
              </span>
              <SeverityBadge label={d.tag} size="sm" />
            </div>
            <p className="text-xs font-semibold text-[var(--text-primary)] mb-1 line-clamp-1">{d.label}</p>
            <p className="font-data text-[10px] text-[var(--text-secondary)] leading-relaxed">{d.description}</p>
          </button>
        )
      })}
    </div>
  )
}
