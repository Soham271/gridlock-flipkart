"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconLayoutDashboard,
  IconScanEye,
  IconHistory,
  IconChartBar,
} from "@tabler/icons-react"

const links = [
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/predict",   label: "Predict",   icon: IconScanEye },
  { href: "/history",   label: "History",   icon: IconHistory },
  { href: "/model",     label: "Model",     icon: IconChartBar },
]

export default function Navbar() {
  const path = usePathname()

  return (
    <>
      {/* Desktop header */}
      <header className="border-b border-[#1c1c21] bg-[#09090b] h-[52px] flex items-center px-6 sticky top-0 z-30">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 anim-dot" />
              <span className="text-zinc-50 font-medium text-sm tracking-tight">ASTRAM</span>
              <span className="text-zinc-600 text-sm font-light">/ Gridlock</span>
            </div>
            <span className="hidden md:block text-[10px] font-medium text-zinc-600 uppercase tracking-[0.15em] border-l border-[#1c1c21] pl-3">
              Bengaluru Traffic Intelligence
            </span>
          </Link>

          {/* Desktop nav — hidden on mobile */}
          <nav className="hidden md:flex items-center">
            {links.map(({ href, label, icon: Icon }) => {
              const active = path === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-2 px-3 py-[14px] text-xs font-medium transition-colors
                    ${active ? "text-zinc-50 border-b-2 border-orange-500" : "text-zinc-500 hover:text-zinc-300 border-b-2 border-transparent"}`}
                >
                  <Icon size={14} stroke={1.75} />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Mobile bottom tab bar — visible only on mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090b] border-t border-[#1c1c21] flex">
        {links.map(({ href, label, icon: Icon }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors
                ${active ? "text-orange-500" : "text-zinc-600 hover:text-zinc-400"}`}
            >
              <Icon size={20} stroke={active ? 2 : 1.5} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Spacer so mobile content isn't hidden behind the tab bar */}
      <div className="md:hidden h-[60px]" aria-hidden />
    </>
  )
}
