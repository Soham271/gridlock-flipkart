const DOT: Record<string, string> = {
  Low:      "dot-low",
  Medium:   "dot-medium",
  High:     "dot-high",
  Critical: "dot-critical",
}

const TEXT: Record<string, string> = {
  Low:      "text-[#4ade80]",
  Medium:   "text-[#facc15]",
  High:     "text-[#fb923c]",
  Critical: "text-[#f87171]",
}

interface Props {
  label: string
  size?: "sm" | "md" | "lg"
}

export default function SeverityBadge({ label, size = "md" }: Props) {
  const dotSize = size === "lg" ? "w-2 h-2" : "w-1.5 h-1.5"
  const textSize = size === "sm" ? "text-[11px]" : size === "lg" ? "text-sm" : "text-xs"
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium ${textSize} ${TEXT[label] ?? "text-[#71717a]"}`}>
      <span className={`${dotSize} rounded-full shrink-0 ${DOT[label] ?? "bg-[#71717a]"}`} />
      {label}
    </span>
  )
}
