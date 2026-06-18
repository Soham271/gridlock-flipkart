"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, MapPin, Clock } from "lucide-react"

const links = [
  { href: "/",        label: "Dashboard", icon: Activity },
  { href: "/predict", label: "Predict",   icon: MapPin },
  { href: "/history", label: "History",   icon: Clock },
]

export default function Navbar() {
  const path = usePathname()
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shrink-0" />
        <span className="font-bold text-white text-base sm:text-lg tracking-tight">ASTRAM Gridlock</span>
        <span className="hidden md:inline text-gray-500 text-xs ml-1">Bengaluru Traffic Intelligence</span>
      </div>
      <div className="flex gap-1 overflow-x-auto">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap
              ${path === href
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
