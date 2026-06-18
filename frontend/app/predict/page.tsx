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
    setLoading(true)
    setError(null)
    setLastReq(req)
    try {
      const res = await predictEvent(req)
      setResult(res)
      saveEntry(req, res)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Predict Congestion Impact</h1>
        <p className="text-gray-400 text-sm mt-1">Fill in event details or click the map to set location</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left — Form + Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <EventForm onSubmit={handleSubmit} loading={loading} pickedLocation={pickedLocation} />
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-xs mb-2">Click map to set location</p>
            <BengaluruMap
              onMapClick={(lat, lng) => setPickedLocation({ lat, lng })}
              pickedLocation={pickedLocation}
              entries={[]}
              height="260px"
            />
          </div>
        </div>

        {/* Right — Results */}
        <div className="lg:col-span-3 space-y-4">
          {error && (
            <div className="bg-red-900/40 border border-red-700 rounded-xl p-4 text-red-300">
              ⚠️ {error}
            </div>
          )}

          {!result && !loading && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
              <div className="text-5xl mb-3">🚦</div>
              <p className="text-gray-400">Fill in the event details and click <strong className="text-white">Predict Congestion</strong> to see severity, confidence, and deployment recommendations.</p>
            </div>
          )}

          {loading && <PredictionSkeleton />}

          {result && !loading && (
            <>
              <SeverityCard result={result} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProbabilityChart probs={result.class_probabilities} />
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex flex-col gap-3">
                  <h3 className="text-white font-semibold">Event Details</h3>
                  {lastReq && (
                    <div className="text-sm space-y-1.5 text-gray-300">
                      <div><span className="text-gray-500">Cause:</span> {lastReq.event_cause.replace(/_/g, " ")}</div>
                      <div><span className="text-gray-500">Type:</span> {lastReq.event_type}</div>
                      <div><span className="text-gray-500">Hour:</span> {lastReq.start_hour}:00</div>
                      <div><span className="text-gray-500">Cluster:</span> Zone {result.location_cluster}</div>
                      {lastReq.corridor && <div><span className="text-gray-500">Corridor:</span> {lastReq.corridor}</div>}
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
