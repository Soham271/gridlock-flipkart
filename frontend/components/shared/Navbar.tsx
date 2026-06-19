"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ScanLine, ClockIcon } from "lucide-react"

const links = [
  { href: "/",        label: "Dashboard", icon: LayoutDashboard },
  { href: "/predict", label: "Predict",   icon: ScanLine },
  { href: "/history", label: "History",   icon: ClockIcon },
]

export default function Navbar() {
  const path = usePathname()
  return (
    <header className="border-b border-[#1c1c21] bg-[#09090b] h-[52px] flex items-center px-6">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 anim-dot" />
            <span className="text-[#e4e4e7] font-semibold text-sm tracking-tight">ASTRAM</span>
            <span className="text-[#3f3f46] text-sm font-light">/ Gridlock</span>
          </div>
          <span className="hidden md:block text-[10px] font-medium text-[#3f3f46] uppercase tracking-[0.15em] border-l border-[#1c1c21] pl-3">
            Bengaluru Traffic Intelligence
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-0.5">
          {links.map(({ href, label, icon: Icon }) => {
            const active = path === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors
                  ${active
                    ? "bg-[#1c1c21] text-[#e4e4e7]"
                    : "text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#141418]"
                  }`}
              >
                <Icon size={13} strokeWidth={1.5} />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
