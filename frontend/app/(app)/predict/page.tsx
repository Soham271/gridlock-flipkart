"use client"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"
import EventForm from "@/components/prediction/EventForm"
import DemoScenarios from "@/components/prediction/DemoScenarios"
import AnalysisPopup from "@/components/prediction/AnalysisPopup"
import { PredictRequest, PredictResponse, LocationSuggestion } from "@/types"
import { predictEvent, locateAt } from "@/lib/api"
import { saveEntry } from "@/lib/history"
import { IconScanEye, IconMapPin, IconChevronDown } from "@tabler/icons-react"
import { pageContainer as container, fadeUp as item } from "@/lib/motion"

const BengaluruMap = dynamic(() => import("@/components/map/BengaluruMap"), { ssr: false })

export default function PredictPage() {
  const reduced = useReducedMotion()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationSuggestion, setLocationSuggestion] = useState<LocationSuggestion | null>(null)
  const [locating, setLocating] = useState(false)
  const [demoPreset, setDemoPreset] = useState<PredictRequest | null>(null)
  const [activeDemoId, setActiveDemoId] = useState<string | null>(null)
  const [demosOpen, setDemosOpen] = useState(true)
  const [popupOpen, setPopupOpen] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)

  const handleSubmit = async (req: PredictRequest) => {
    setLoading(true)
    setError(null)
    setResult(null)
    setSavedId(null)
    setPopupOpen(true)
    setClosing(false)
    try {
      const res = await predictEvent(req)
      const entry = saveEntry(req, res)
      setResult(res)
      setSavedId(entry.id)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLoad = (preset: PredictRequest, label: string) => {
    setDemoPreset(preset)
    setActiveDemoId(label)
    setPickedLocation({ lat: preset.latitude, lng: preset.longitude })
    setLocationSuggestion(null)
    setDemosOpen(false)
    setResult(null)
    setError(null)
  }

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setDemoPreset(null)
    setActiveDemoId(null)
    setPickedLocation({ lat, lng })
    setLocationSuggestion(null)
    setLocating(true)
    try {
      const suggestion = await locateAt(lat, lng)
      setLocationSuggestion(suggestion)
    } catch {
      setLocationSuggestion(null)
    } finally {
      setLocating(false)
    }
  }, [])

  const handleViewFull = useCallback(() => {
    if (savedId) {
      setClosing(true)
      setTimeout(() => {
        setPopupOpen(false)
        router.push(`/predict/${savedId}`)
      }, 150)
    }
  }, [savedId, router])

  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(() => setPopupOpen(false), 100)
  }, [])

  return (
    <>
      <AnalysisPopup
        open={popupOpen && !closing}
        loading={loading}
        result={result}
        error={error}
        onClose={handleClose}
        onViewFull={handleViewFull}
      />

      <motion.div
        variants={reduced ? {} : container}
        initial="hidden"
        animate="show"
        className="px-6 py-6 max-w-7xl mx-auto"
      >
        <motion.div variants={reduced ? {} : item} className="mb-6">
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight">Predict Congestion</h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-0.5">
            Click the map to auto-fill location · or load a quick demo
          </p>
        </motion.div>

        {/* Collapsible demo strip — stays hidden after map click to avoid flash/lag */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setDemosOpen(o => !o)}
            className="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-2 transition-colors"
          >
            <IconChevronDown
              size={14}
              className={`transition-transform duration-200 ${demosOpen ? "rotate-0" : "-rotate-90"}`}
            />
            Quick demo scenarios
            {!demosOpen && activeDemoId && (
              <span className="text-[var(--accent-signal)]">· {activeDemoId}</span>
            )}
            {!demosOpen && pickedLocation && !activeDemoId && (
              <span className="text-[var(--accent-signal)]">· map location active</span>
            )}
          </button>
          <AnimatePresence initial={false}>
            {demosOpen && (
              <motion.div
                key="demo-strip"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <DemoScenarios
                  activeId={activeDemoId}
                  onLoad={handleDemoLoad}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="surface rounded-lg overflow-hidden flex-1 h-full">
              <EventForm
                onSubmit={handleSubmit}
                loading={loading}
                pickedLocation={pickedLocation}
                locationSuggestion={locationSuggestion}
                locating={locating}
                externalPreset={demoPreset}
              />
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="surface rounded-lg overflow-hidden flex flex-col min-h-[400px]">
              <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center gap-2 shrink-0">
                <IconMapPin size={13} stroke={1.5} className="text-[var(--text-secondary)]" />
                <span className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">
                  {locating ? "Detecting police station & corridor…" : "Click map to set coordinates"}
                </span>
              </div>
              <div className="flex-1 relative min-h-[340px]">
                <div className="absolute inset-0">
                  <BengaluruMap
                    onMapClick={handleMapClick}
                    pickedLocation={pickedLocation}
                    entries={[]}
                    height="100%"
                  />
                </div>
              </div>
            </div>

            <div className="surface border-dashed border-2 border-[var(--border-subtle)] bg-transparent rounded-lg flex flex-col items-center justify-center px-6 py-12 gap-3 text-center">
              <IconScanEye size={36} stroke={1} className="text-[var(--text-tertiary)]" />
              <p className="text-sm text-[var(--text-secondary)]">No prediction yet</p>
              <p className="text-xs text-[var(--text-tertiary)]">
                Configure the event, then click{" "}
                <span className="text-[var(--text-primary)] font-medium">Run Prediction</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
