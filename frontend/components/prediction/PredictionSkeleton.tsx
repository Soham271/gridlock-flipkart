export default function PredictionSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-36 bg-gray-700/60 rounded-xl border border-gray-700" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-52 bg-gray-700/60 rounded-xl border border-gray-700" />
        <div className="h-52 bg-gray-700/60 rounded-xl border border-gray-700" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-gray-700/60 rounded-xl border border-gray-700" />
        ))}
      </div>
    </div>
  )
}
