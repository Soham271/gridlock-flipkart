"use client"
import { useEffect, useState, useRef, type ComponentType } from "react"
import { motion, useReducedMotion } from "framer-motion"
import dynamic from "next/dynamic"
import { useHistory } from "@/lib/history"
import { SEVERITY_COLORS } from "@/lib/severity"
import SeverityBadge from "@/components/shared/SeverityBadge"
import GlowBorder from "@/components/shared/GlowBorder"
import Link from "next/link"
import {
  IconArrowRight,
  IconAlertTriangle,
  IconChartPie,
  IconMapPin,
  IconClockHour4,
  IconBolt,
  IconBuildingArch,
  IconCarCrash,
  IconTool,
  IconDroplet,
  IconCrown,
  IconRun,
  IconFlame,
  IconConfetti
} from "@tabler/icons-react"
import { pageContainer as container, fadeUp as item } from "@/lib/motion"

const BengaluruMap = dynamic(() => import("@/components/map/BengaluruMap"), { ssr: false })

function getEventIcon(cause: string) {
  switch (cause) {
    case "public_event":      return <IconConfetti size={16} />
    case "accident":          return <IconCarCrash size={16} />
    case "vehicle_breakdown": return <IconTool size={16} />
    case "water_logging":     return <IconDroplet size={16} />
    case "road_work":         return <IconBuildingArch size={16} />
    case "procession":        return <IconRun size={16} />
    case "vip_movement":      return <IconCrown size={16} />
    case "sports_event":      return <IconRun size={16} />
    case "fire":              return <IconFlame size={16} />
    default:                  return <IconMapPin size={16} />
  }
}

function useCountUp(target: number, duration = 600, enabled = true) {
  const [value, setValue] = useState(0)
  const raf = useRef<number>(0)

  const animating = enabled && target !== 0

  useEffect(() => {
    if (!animating) return
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      setValue(Math.round(p * target))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration, animating])

  return animating ? value : target
}

function StatCard({
  label,
  rawValue,
  displayValue,
  icon: Icon,
  accent,
  delay,
}: {
  label: string
  rawValue: number
  displayValue: string
  icon: ComponentType<{ size?: number; stroke?: number; strokeWidth?: number; className?: string }>
  accent?: boolean
  delay: number
}) {
  const reduced = useReducedMotion()
  const count = useCountUp(rawValue, 500, !reduced)

  return (
    <GlowBorder className="h-full">
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="p-5 flex flex-col gap-3 h-full"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">{label}</p>
          <Icon
            size={14}
            stroke={1.5}
            className={accent && rawValue > 0 ? "text-[var(--severity-high)]" : "text-[var(--text-secondary)]"}
          />
        </div>
        <p
          className={`font-data text-3xl font-medium tracking-tight tabular-nums transition-colors ${
            accent && rawValue > 0 ? "text-[var(--severity-high)]" : "text-[var(--text-primary)]"
          }`}
        >
          {typeof rawValue === "number" && displayValue.endsWith("%")
            ? displayValue
            : typeof rawValue === "number"
            ? count
            : displayValue}
        </p>
      </motion.div>
    </GlowBorder>
  )
}

export default function Dashboard() {
  const reduced = useReducedMotion()
  const history = useHistory()

  const recent = history.slice(0, 6)
  const sevCounts = ["Low", "Medium", "High", "Critical"].map(label => ({
    name: label,
    value: history.filter(h => h.severity_label === label).length,
    fill: SEVERITY_COLORS[label],
  })).filter(d => d.value > 0)

  const avgConf = history.length
    ? (history.reduce((s, h) => s + h.confidence, 0) / history.length * 100).toFixed(1)
    : null

  const criticalCount = history.filter(h => h.severity_level === 3).length
  const highCount     = history.filter(h => h.severity_level === 2).length

  const stats = [
    { label: "Total Predictions", rawValue: history.length,  displayValue: String(history.length), icon: IconBolt,          accent: false },
    { label: "Critical",          rawValue: criticalCount,   displayValue: String(criticalCount),   icon: IconAlertTriangle, accent: true  },
    { label: "High Severity",     rawValue: highCount,       displayValue: String(highCount),       icon: IconChartPie,      accent: true  },
    { label: "Model Agreement",   rawValue: 0,               displayValue: avgConf ? `${avgConf}%` : "—", icon: IconClockHour4, accent: false },
  ]

  return (
    <motion.div
      variants={reduced ? {} : container}
      initial="hidden"
      animate="show"
      className="relative px-6 py-6 max-w-7xl mx-auto space-y-6 pb-6"
    >
      {/* Page title */}
      <motion.div variants={reduced ? {} : item}>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight">Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-0.5">Bengaluru congestion monitoring</p>
      </motion.div>

      {/* Stat row */}
      <motion.div variants={reduced ? {} : item}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.06} />
        ))}
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <GlowBorder className="lg:col-span-2 h-full" innerClassName="flex flex-col">
          <motion.div variants={reduced ? {} : item} className="flex flex-col h-full min-h-[450px]">
            <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <IconMapPin size={13} stroke={1.5} className="text-[var(--text-secondary)]" />
                <span className="text-xs text-[var(--text-secondary)]">Incident Map</span>
              </div>
              <span className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Bengaluru</span>
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-0">
                <BengaluruMap entries={history} height="100%" />
              </div>
            </div>
          </motion.div>
        </GlowBorder>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Severity split - Stacked Bar instead of Donut */}
          <GlowBorder>
            <motion.div variants={reduced ? {} : item}>
              <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center gap-2">
                <IconChartPie size={13} stroke={1.5} className="text-[var(--text-secondary)]" />
                <span className="text-xs text-[var(--text-secondary)]">Severity Distribution</span>
              </div>
              <div className="p-4">
                {sevCounts.length > 0 ? (
                  <>
                    <div className="relative w-full max-w-[380px] aspect-[3/2] mx-auto mb-4 mt-2">
                      <svg viewBox="-180 -120 360 240" className="w-full h-full overflow-visible">
                        <defs>
                          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="8" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                          </filter>
                        </defs>

                        {/* Glow Underlay */}
                        {(() => {
                          let cumulativeFraction = 0;
                          const C = 2 * Math.PI * 55;
                          return sevCounts.map(d => {
                            const fraction = d.value / history.length;
                            const offset = -cumulativeFraction * C;
                            cumulativeFraction += fraction;
                            return (
                              <circle
                                key={`glow-${d.name}`}
                                cx="0" cy="0" r="55"
                                fill="transparent"
                                stroke={d.fill}
                                strokeWidth="24"
                                strokeDasharray={`${fraction * C} ${C}`}
                                strokeDashoffset={offset}
                                className="opacity-25"
                                filter="url(#glow)"
                                transform="rotate(-90)"
                              />
                            )
                          });
                        })()}

                        {/* Donut Chart */}
                        {(() => {
                          let cumulativeFraction = 0;
                          const C = 2 * Math.PI * 55;
                          return sevCounts.map(d => {
                            const fraction = d.value / history.length;
                            const offset = -cumulativeFraction * C;
                            cumulativeFraction += fraction;
                            return (
                              <circle
                                key={`donut-${d.name}`}
                                cx="0" cy="0" r="55"
                                fill="transparent"
                                stroke={d.fill}
                                strokeWidth="18"
                                strokeDasharray={`${fraction * C} ${C}`}
                                strokeDashoffset={offset}
                                className="transition-all duration-500 ease-in-out hover:stroke-[20px] cursor-pointer"
                                transform="rotate(-90)"
                              />
                            )
                          });
                        })()}

                        {/* Lines */}
                        {(() => {
                          let currentAngle = -Math.PI / 2;
                          return sevCounts.map(d => {
                            const fraction = d.value / history.length;
                            const sliceAngle = fraction * 2 * Math.PI;
                            const midAngle = currentAngle + sliceAngle / 2;
                            
                            const startR = 66;
                            const x1 = startR * Math.cos(midAngle);
                            const y1 = startR * Math.sin(midAngle);
                            
                            const midR = 82;
                            const x2 = midR * Math.cos(midAngle);
                            const y2 = midR * Math.sin(midAngle);
                            
                            const isRight = Math.cos(midAngle) > 0;
                            const x3 = x2 + (isRight ? 15 : -15);
                            const y3 = y2;
                            
                            currentAngle += sliceAngle;
                            
                            return (
                              <path
                                key={`line-${d.name}`}
                                d={`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3}`}
                                fill="none"
                                stroke={d.fill}
                                strokeWidth="1.5"
                                className="opacity-60"
                              />
                            );
                          });
                        })()}
                      </svg>

                      {/* HTML Labels */}
                      {(() => {
                        let currentAngle = -Math.PI / 2;
                        return sevCounts.map(d => {
                          const fraction = d.value / history.length;
                          const sliceAngle = fraction * 2 * Math.PI;
                          const midAngle = currentAngle + sliceAngle / 2;
                          const isRight = Math.cos(midAngle) > 0;
                          
                          const midR = 82;
                          const x2 = midR * Math.cos(midAngle);
                          const y2 = midR * Math.sin(midAngle);
                          const x3 = x2 + (isRight ? 15 : -15);
                          const y3 = y2;
                          
                          currentAngle += sliceAngle;
                          
                          return (
                            <div
                              key={`label-${d.name}`}
                              className="absolute flex flex-col justify-center pointer-events-none"
                              style={{
                                left: `calc(50% + ${(x3 / 360) * 100}%)`,
                                top: `calc(50% + ${(y3 / 240) * 100}%)`,
                                transform: `translate(${isRight ? '6px' : 'calc(-100% - 6px)'}, -50%)`
                              }}
                            >
                              <div 
                                className="px-2.5 py-1 rounded-md border text-[11px] font-medium whitespace-nowrap bg-[var(--bg-elevated)]/90 backdrop-blur-sm"
                                style={{ borderColor: `${d.fill}40` }}
                              >
                                <span style={{ color: d.fill }}>{d.name}: </span>
                                <span className="text-[var(--text-primary)]">{d.value}</span> 
                                <span className="text-[var(--text-secondary)] opacity-60 mx-1">|</span> 
                                <span className="text-[var(--text-secondary)]">{(fraction * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          );
                        });
                      })()}
                      
                      {/* Center Text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-0.5">
                        <span className="font-data text-[42px] font-bold text-[var(--text-primary)] leading-none tracking-tight">{history.length}</span>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Events</span>
                      </div>
                    </div>
                    

                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <IconChartPie size={28} stroke={1} className="text-[var(--text-tertiary)]" />
                    <p className="text-xs text-[var(--text-secondary)]">No data yet</p>
                    <p className="text-xs text-[var(--text-tertiary)]">Predictions will appear here</p>
                  </div>
                )}
              </div>
            </motion.div>
          </GlowBorder>

          {/* Recent events */}
          <motion.div variants={reduced ? {} : item}
            className="surface rounded-lg overflow-hidden flex-1 flex flex-col">
            <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <IconClockHour4 size={13} stroke={1.5} className="text-[var(--text-secondary)]" />
                <span className="text-xs text-[var(--text-secondary)]">Recent Events</span>
              </div>
              <Link href="/history" className="btn-ghost !py-0.5 !px-2 !text-[11px] !gap-1">
                All <IconArrowRight size={11} />
              </Link>
            </div>
            <div className="divide-y divide-[var(--border-subtle)] overflow-auto flex-1">
              {recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-10 gap-2 h-full">
                  <IconClockHour4 size={28} stroke={1} className="text-[var(--text-tertiary)]" />
                  <p className="text-xs text-[var(--text-secondary)]">No data yet</p>
                  <Link href="/predict" className="btn-primary mt-2">
                    Run First Prediction <IconArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                recent.map((e, i) => (
                  <motion.div
                    key={e.id}
                    initial={reduced ? {} : { opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.2 }}
                    className="px-4 py-3 flex items-center justify-between hover:bg-[var(--bg-elevated-2)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg bg-[var(--bg-base)] w-8 h-8 rounded-full flex items-center justify-center border border-[var(--border-subtle)] shadow-sm shrink-0">
                        {getEventIcon(e.input.event_cause)}
                      </span>
                      <div>
                        <p className="text-xs font-medium text-[var(--text-primary)] capitalize line-clamp-1">{e.input.event_cause.replace(/_/g, " ")}</p>
                        <p className="font-data text-[10px] text-[var(--text-secondary)] mt-0.5">{new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <SeverityBadge label={e.severity_label} size="sm" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

    </motion.div>
  )
}
