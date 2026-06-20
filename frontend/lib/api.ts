import { PredictRequest, PredictResponse, MetaResponse } from "@/types"

let BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
if (!BASE.startsWith("http://") && !BASE.startsWith("https://")) {
  BASE = "https://" + BASE
}
BASE = BASE.replace(/\/+$/, "")

export async function predictEvent(req: PredictRequest): Promise<PredictResponse> {
  const res = await fetch(`${BASE}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }))
    throw new Error(err.error || "Prediction failed")
  }
  return res.json()
}

export async function getMeta(): Promise<MetaResponse> {
  const res = await fetch(`${BASE}/api/meta`)
  if (!res.ok) throw new Error("Failed to fetch meta")
  return res.json()
}
