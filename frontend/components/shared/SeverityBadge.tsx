const DOT: Record<string, string> = {
  Low:      "bg-[#22c55e]",
  Medium:   "bg-[#eab308]",
  High:     "bg-[#f97316]",
  Critical: "bg-[#ef4444]",
}

const TEXT: Record<string, string> = {
  Low:      "text-[#22c55e]",
  Medium:   "text-[#eab308]",
  High:     "text-[#f97316]",
  Critical: "text-[#ef4444]",
}

interface Props {
  label: string
  size?: "sm" | "md" | "lg"
}

export default function SeverityBadge({ label, size = "md" }: Props) {
  const dotSize  = size === "lg" ? "w-2 h-2"   : "w-1.5 h-1.5"
  const textSize = size === "sm" ? "text-[11px]" : size === "lg" ? "text-sm" : "text-xs"
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium ${textSize} ${TEXT[label] ?? "text-zinc-500"}`}>
      <span className={`${dotSize} rounded-full shrink-0 ${DOT[label] ?? "bg-zinc-500"}`} />
      {label}
    </span>
  )
}
