import Loader from "@/components/prediction/Loader"

export default function Loading() {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center gap-6">
      <Loader />
      <p className="text-sm font-medium text-[var(--text-secondary)] animate-pulse">
        Loading analysis details...
      </p>
    </div>
  )
}
