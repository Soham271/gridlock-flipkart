import { useSyncExternalStore } from "react"
import { HistoryEntry, PredictRequest, PredictResponse } from "@/types"

const KEY = "gridlock_history"

/* ── Store plumbing ──
   The snapshot has to be referentially stable between reads, so the parsed
   list is cached and only invalidated when the entries actually change. */
const EMPTY: HistoryEntry[] = []
let cache: HistoryEntry[] | null = null
const listeners = new Set<() => void>()

function emit() {
  cache = null
  listeners.forEach(l => l())
}

function subscribe(onChange: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", emit)
  listeners.add(onChange)
  return () => {
    listeners.delete(onChange)
    if (listeners.size === 0) window.removeEventListener("storage", emit)
  }
}

export function saveEntry(input: PredictRequest, result: PredictResponse): HistoryEntry {
  const entry: HistoryEntry = {
    ...result,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    input,
  }
  const existing = getHistory()
  const updated = [entry, ...existing].slice(0, 50)
  localStorage.setItem(KEY, JSON.stringify(updated))
  emit()
  return entry
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return EMPTY
  if (cache) return cache
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || "[]")
  } catch {
    cache = EMPTY
  }
  return cache!
}

export function clearHistory() {
  localStorage.removeItem(KEY)
  emit()
}

/** Subscribes to the stored history — safe to call during SSR, where it
 *  yields an empty list until the client hydrates. */
export function useHistory(): HistoryEntry[] {
  return useSyncExternalStore(subscribe, getHistory, () => EMPTY)
}

/** False during SSR and the hydration pass, true once local storage has
 *  actually been read — so callers can tell "no entry" from "not read yet". */
export function useHistoryHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false)
}
