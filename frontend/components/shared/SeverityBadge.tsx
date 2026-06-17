import { SEVERITY_BG, SEVERITY_EMOJI } from "@/lib/severity"

interface Props {
  label: string
  size?: "sm" | "md" | "lg"
}

export default function SeverityBadge({ label, size = "md" }: Props) {
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : size === "lg" ? "text-base px-4 py-1.5" : "text-sm px-3 py-1"
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold text-white ${SEVERITY_BG[label] ?? "bg-gray-500"} ${sizeClass}`}>
      {SEVERITY_EMOJI[label]} {label}
    </span>
  )
}
