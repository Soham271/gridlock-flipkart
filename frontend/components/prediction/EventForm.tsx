"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PredictRequest, MetaResponse } from "@/types"
import { getMeta } from "@/lib/api"
import { EVENT_CAUSES, EVENT_TYPES, VEH_TYPES } from "@/lib/severity"
import { MapPin, Loader2 } from "lucide-react"

interface Props {
  onSubmit: (req: PredictRequest) => void
  loading: boolean
  onLocationPick?: (cb: (lat: number, lng: number) => void) => void
  pickedLocation?: { lat: number; lng: number } | null
}

const now = new Date()

export default function EventForm({ onSubmit, loading, pickedLocation }: Props) {
  const [meta, setMeta] = useState<MetaResponse | null>(null)
  const [form, setForm] = useState<PredictRequest>({
    latitude:    12.9716,
    longitude:   77.5946,
    event_type:  "planned",
    event_cause: "public_event",
    start_hour:  now.getHours(),
    day_of_week: now.getDay() === 0 ? 6 : now.getDay() - 1,
    month:       now.getMonth() + 1,
    day:         now.getDate(),
    corridor:    undefined,
    police_station: undefined,
    zone:        undefined,
    veh_type:    undefined,
    duration_mins: undefined,
  })

  useEffect(() => {
    getMeta().then(setMeta).catch(() => {})
  }, [])

  useEffect(() => {
    if (pickedLocation) {
      setForm(f => ({ ...f, latitude: pickedLocation.lat, longitude: pickedLocation.lng }))
    }
  }, [pickedLocation])

  const set = (k: keyof PredictRequest, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Location */}
      <div>
        <Label className="text-gray-300 text-sm mb-2 flex items-center gap-1.5">
          <MapPin size={13} /> Location (click map to set)
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Input type="number" step="any" placeholder="Latitude" value={form.latitude}
              onChange={e => set("latitude", parseFloat(e.target.value))}
              className="bg-gray-700 border-gray-600 text-white" required />
          </div>
          <div>
            <Input type="number" step="any" placeholder="Longitude" value={form.longitude}
              onChange={e => set("longitude", parseFloat(e.target.value))}
              className="bg-gray-700 border-gray-600 text-white" required />
          </div>
        </div>
      </div>

      {/* Event Type + Cause */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-gray-300 text-sm mb-1 block">Event Type</Label>
          <select value={form.event_type} onChange={e => set("event_type", e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm">
            {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-gray-300 text-sm mb-1 block">Event Cause</Label>
          <select value={form.event_cause} onChange={e => set("event_cause", e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm">
            {EVENT_CAUSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-4 gap-2">
        <div>
          <Label className="text-gray-300 text-sm mb-1 block">Hour (0-23)</Label>
          <Input type="number" min={0} max={23} value={form.start_hour}
            onChange={e => set("start_hour", parseInt(e.target.value))}
            className="bg-gray-700 border-gray-600 text-white" />
        </div>
        <div>
          <Label className="text-gray-300 text-sm mb-1 block">Day (1-31)</Label>
          <Input type="number" min={1} max={31} value={form.day}
            onChange={e => set("day", parseInt(e.target.value))}
            className="bg-gray-700 border-gray-600 text-white" />
        </div>
        <div>
          <Label className="text-gray-300 text-sm mb-1 block">Month</Label>
          <Input type="number" min={1} max={12} value={form.month}
            onChange={e => set("month", parseInt(e.target.value))}
            className="bg-gray-700 border-gray-600 text-white" />
        </div>
        <div>
          <Label className="text-gray-300 text-sm mb-1 block">Day of Week</Label>
          <select value={form.day_of_week} onChange={e => set("day_of_week", parseInt(e.target.value))}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d,i) => (
              <option key={i} value={i}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Corridor */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-gray-300 text-sm mb-1 block">Corridor</Label>
          <select value={form.corridor ?? ""} onChange={e => set("corridor", e.target.value || undefined)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm">
            <option value="">Non-corridor</option>
            {(meta?.corridors ?? []).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-gray-300 text-sm mb-1 block">Police Station</Label>
          <select value={form.police_station ?? ""} onChange={e => set("police_station", e.target.value || undefined)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm">
            <option value="">Unknown</option>
            {(meta?.police_stations ?? []).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Zone + Duration */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-gray-300 text-sm mb-1 block">Zone</Label>
          <select value={form.zone ?? ""} onChange={e => set("zone", e.target.value || undefined)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm">
            <option value="">Unknown</option>
            {(meta?.zones ?? []).map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-gray-300 text-sm mb-1 block">Est. Duration (mins)</Label>
          <Input type="number" min={0} placeholder="e.g. 120"
            value={form.duration_mins ?? ""}
            onChange={e => set("duration_mins", e.target.value ? parseFloat(e.target.value) : undefined)}
            className="bg-gray-700 border-gray-600 text-white" />
        </div>
      </div>

      {/* Vehicle type */}
      <div>
        <Label className="text-gray-300 text-sm mb-1 block">Vehicle Type (if applicable)</Label>
        <select value={form.veh_type ?? ""} onChange={e => set("veh_type", e.target.value || undefined)}
          className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm">
          {VEH_TYPES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
        </select>
      </div>

      <Button type="submit" disabled={loading}
        className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 text-base">
        {loading ? <><Loader2 size={16} className="animate-spin mr-2" />Analyzing...</> : "Predict Congestion"}
      </Button>
    </form>
  )
}
