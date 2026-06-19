"use client"
import { useState } from "react"
import dynamic from "next/dynamic"
import EventForm from "@/components/prediction/EventForm"
import SeverityCard from "@/components/prediction/SeverityCard"
import ProbabilityChart from "@/components/prediction/ProbabilityChart"
import PredictionSkeleton from "@/components/prediction/PredictionSkeleton"
import ResourcePanel from "@/components/prediction/ResourcePanel"
import { PredictRequest, PredictResponse } from "@/types"
import { predictEvent } from "@/lib/api"
import { saveEntry } from "@/lib/history"

const BengaluruMap = dynamic(() => import("@/components/map/BengaluruMap"), { ssr: false })

export default function PredictPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [lastReq, setLastReq] = useState<PredictRequest | null>(null)

  const handleSubmit = async (req: PredictRequest) => {
    setLoading(true); setError(null); setLastReq(req)
    try {
      const res = await predictEvent(req)
      setResult(res); saveEntry(req, res)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-5 anim-in">
        <h1 className="text-base font-semibold text-[#e4e4e7]">Predict Congestion</h1>
        <p className="text-xs text-[#52525b] mt-0.5">Fill in event details or click the map to set location</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left — Form + Map */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="surface rounded overflow-hidden anim-in delay-1">
            <EventForm onSubmit={handleSubmit} loading={loading} pickedLocation={pickedLocation} />
          </div>

          <div className="surface rounded overflow-hidden anim-in delay-2">
            <div className="px-4 py-2.5 border-b border-[#1c1c21]">
              <span className="text-[10px] text-[#3f3f46] uppercase tracking-wider">Click map to set coordinates</span>
            </div>
            <div className="p-2">
              <BengaluruMap
                onMapClick={(lat, lng) => setPickedLocation({ lat, lng })}
                pickedLocation={pickedLocation}
                entries={[]}
                height="230px"
              />
            </div>
          </div>
        </div>

        {/* Right — Results */}
        <div className="lg:col-span-3 space-y-4">
          {error && (
            <div className="surface rounded border-l-2 border-l-[#f87171] px-4 py-3 anim-in">
              <p className="text-[#f87171] text-xs">{error}</p>
            </div>
          )}

          {!result && !loading && (
            <div className="surface rounded px-6 py-16 text-center anim-in delay-3">
              <p className="text-xs font-medium text-[#a1a1aa] mb-1">No prediction yet</p>
              <p className="text-[11px] text-[#3f3f46]">
                Configure the event on the left and click <strong className="text-[#71717a]">Run Prediction</strong>
              </p>
            </div>
          )}

          {loading && <PredictionSkeleton />}

          {result && !loading && (
            <>
              <SeverityCard result={result} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProbabilityChart probs={result.class_probabilities} />

                {/* Event summary */}
                <div className="surface rounded anim-in">
                  <div className="px-4 py-3 border-b border-[#1c1c21]">
                    <span className="text-xs font-medium text-[#a1a1aa]">Event Summary</span>
                  </div>
                  {lastReq && (
                    <div className="px-4 py-1 divide-y divide-[#1c1c21]">
                      {[
                        { k: "Cause",    v: lastReq.event_cause.replace(/_/g, " ") },
                        { k: "Type",     v: lastReq.event_type },
                        { k: "Time",     v: `${String(lastReq.start_hour).padStart(2,"0")}:00` },
                        { k: "Cluster",  v: `Zone ${result.location_cluster}` },
                        ...(lastReq.corridor ? [{ k: "Corridor", v: lastReq.corridor }] : []),
                        ...(lastReq.zone     ? [{ k: "Zone",     v: lastReq.zone }]     : []),
                      ].map(({ k, v }) => (
                        <div key={k} className="flex justify-between items-center py-2.5">
                          <span className="text-[10px] text-[#52525b] uppercase tracking-wider">{k}</span>
                          <span className="text-xs text-[#a1a1aa] font-medium capitalize">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <ResourcePanel rec={result.recommendations} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
