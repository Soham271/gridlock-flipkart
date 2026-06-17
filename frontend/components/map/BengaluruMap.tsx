"use client"
import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { HistoryEntry } from "@/types"
import { SEVERITY_COLORS } from "@/lib/severity"

// Fix default icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

function severityIcon(label: string) {
  const color = SEVERITY_COLORS[label] ?? "#888"
  return L.divIcon({
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 0 6px ${color}88;"></div>`,
    className: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

function ClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onMapClick?.(e.latlng.lat, e.latlng.lng) }
  })
  return null
}

interface Props {
  entries?: HistoryEntry[]
  onMapClick?: (lat: number, lng: number) => void
  pickedLocation?: { lat: number; lng: number } | null
  height?: string
}

export default function BengaluruMap({ entries = [], onMapClick, pickedLocation, height = "400px" }: Props) {
  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-gray-700">
      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={12}
        style={{ height: "100%", width: "100%", background: "#1a1a2e" }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        <ClickHandler onMapClick={onMapClick} />

        {pickedLocation && (
          <Marker position={[pickedLocation.lat, pickedLocation.lng]}>
            <Popup>📍 Selected location<br />{pickedLocation.lat.toFixed(4)}, {pickedLocation.lng.toFixed(4)}</Popup>
          </Marker>
        )}

        {entries.map(e => (
          <Marker
            key={e.id}
            position={[e.input.latitude, e.input.longitude]}
            icon={severityIcon(e.severity_label)}
          >
            <Popup>
              <div className="text-sm">
                <strong>{e.severity_label}</strong> — {e.input.event_cause.replace(/_/g, " ")}<br />
                {(e.confidence * 100).toFixed(1)}% confidence<br />
                {new Date(e.timestamp).toLocaleString()}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
