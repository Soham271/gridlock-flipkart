"use client"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { PredictRequest, MetaResponse } from "@/types"
import { getMeta } from "@/lib/api"
import { validatePredictRequest } from "@/lib/validate"
import { EVENT_CAUSES, EVENT_TYPES, VEH_TYPES } from "@/lib/severity"
import { Loader2 } from "lucide-react"

interface Props {
  onSubmit: (req: PredictRequest) => void
  loading: boolean
  pickedLocation?: { lat: number; lng: number } | null
  externalPreset?: PredictRequest | null
}

const now = new Date()

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] text-[#52525b] uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
)

const inputCls = "w-full bg-[#141418] border border-[#1c1c21] text-[#e4e4e7] text-sm rounded px-3 py-2 placeholder:text-[#3f3f46] transition-colors hover:border-[#2a2a32]"
const selectCls = `${inputCls} cursor-pointer`

export default function EventForm({ onSubmit, loading, pickedLocation, externalPreset }: Props) {
  const [meta, setMeta] = useState<MetaResponse | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [form, setForm] = useState<PredictRequest>({
    latitude:       12.9716,
    longitude:      77.5946,
    event_type:     "planned",
    event_cause:    "public_event",
    start_hour:     now.getHours(),
    day_of_week:    now.getDay() === 0 ? 6 : now.getDay() - 1,
    month:          now.getMonth() + 1,
    day:            now.getDate(),
    corridor:       undefined,
    police_station: undefined,
    zone:           undefined,
    veh_type:       undefined,
    duration_mins:  undefined,
  })

  useEffect(() => { getMeta().then(setMeta).catch(() => {}) }, [])
  useEffect(() => {
    if (pickedLocation) setForm(f => ({ ...f, latitude: pickedLocation.lat, longitude: pickedLocation.lng }))
  }, [pickedLocation])
  useEffect(() => {
    if (externalPreset) setForm(externalPreset)
  }, [externalPreset])

  const set = (k: keyof PredictRequest, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const err = validatePredictRequest(form)
    if (err) { setFormError(err); return }
    setFormError(null)
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-0 divide-y divide-[#1c1c21]">
      {formError && (
        <div className="px-4 py-2.5 text-[#f87171] text-xs bg-[#1c1010] border-b border-[#2a1515]">
          {formError}
        </div>
      )}

      {/* Location */}
      <div className="px-4 py-4 space-y-3">
        <p className="text-[10px] text-[#3f3f46] uppercase tracking-[0.12em] font-medium">Location</p>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Latitude">
            <input type="number" step="any" placeholder="12.9716" value={form.latitude} min={12} max={13} required
              onChange={e => set("latitude", parseFloat(e.target.value))}
              className={inputCls} />
          </Field>
          <Field label="Longitude">
            <input type="number" step="any" placeholder="77.5946" value={form.longitude} min={77} max={78} required
              onChange={e => set("longitude", parseFloat(e.target.value))}
              className={inputCls} />
          </Field>
        </div>
        {pickedLocation && (
          <p className="text-[10px] text-orange-500">Location set from map</p>
        )}
      </div>

      {/* Event */}
      <div className="px-4 py-4 space-y-3">
        <p className="text-[10px] text-[#3f3f46] uppercase tracking-[0.12em] font-medium">Event</p>
        <Field label="Type">
          <select value={form.event_type} onChange={e => set("event_type", e.target.value)} className={selectCls}>
            {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Cause">
          <select value={form.event_cause} onChange={e => set("event_cause", e.target.value)} className={selectCls}>
            {EVENT_CAUSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </Field>
      </div>

      {/* Date & Time */}
      <div className="px-4 py-4 space-y-3">
        <p className="text-[10px] text-[#3f3f46] uppercase tracking-[0.12em] font-medium">Date & Time</p>
        <div className="grid grid-cols-4 gap-2">
          {([
            { label: "Hour",  key: "start_hour", min: 0,  max: 23 },
            { label: "Day",   key: "day",        min: 1,  max: 31 },
            { label: "Month", key: "month",      min: 1,  max: 12 },
          ] as const).map(f => (
            <Field key={f.key} label={f.label}>
              <input type="number" min={f.min} max={f.max} value={(form as any)[f.key]}
                onChange={e => set(f.key as keyof PredictRequest, parseInt(e.target.value))}
                className={inputCls} />
            </Field>
          ))}
          <Field label="Weekday">
            <select value={form.day_of_week} onChange={e => set("day_of_week", parseInt(e.target.value))} className={selectCls}>
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d,i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </Field>
        </div>
      </div>

      {/* Context */}
      <div className="px-4 py-4 space-y-3">
        <p className="text-[10px] text-[#3f3f46] uppercase tracking-[0.12em] font-medium">Location Context</p>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Corridor">
            <select value={form.corridor ?? ""} onChange={e => set("corridor", e.target.value || undefined)} className={selectCls}>
              <option value="">Non-corridor</option>
              {(meta?.corridors ?? []).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Zone">
            <select value={form.zone ?? ""} onChange={e => set("zone", e.target.value || undefined)} className={selectCls}>
              <option value="">Unknown</option>
              {(meta?.zones ?? []).map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Police Station">
          <select value={form.police_station ?? ""} onChange={e => set("police_station", e.target.value || undefined)} className={selectCls}>
            <option value="">Unknown</option>
            {(meta?.police_stations ?? []).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
      </div>

      {/* Additional */}
      <div className="px-4 py-4 space-y-3">
        <p className="text-[10px] text-[#3f3f46] uppercase tracking-[0.12em] font-medium">Additional</p>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Vehicle Type">
            <select value={form.veh_type ?? ""} onChange={e => set("veh_type", e.target.value || undefined)} className={selectCls}>
              {VEH_TYPES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
          </Field>
          <Field label="Duration (min)">
            <input type="number" min={0} placeholder="e.g. 120"
              value={form.duration_mins ?? ""}
              onChange={e => set("duration_mins", e.target.value ? parseFloat(e.target.value) : undefined)}
              className={inputCls} />
          </Field>
        </div>
      </div>

      {/* Submit */}
      <div className="px-4 py-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-[#1c1c21] disabled:text-[#52525b] text-white text-sm font-medium py-2.5 rounded transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 size={14} className="animate-spin" /> Analyzing...</>
          ) : (
            "Run Prediction"
          )}
        </button>
      </div>
    </form>
  )
}
