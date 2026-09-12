"use client"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import SmoothScroll from "@/components/providers/SmoothScroll"
import { Brain, GitBranch, Map, Zap, Shield, TrendingUp, ArrowRight, ChevronRight } from "lucide-react"
import RoadGrid from "@/components/ui/RoadGrid"
import Aurora from "@/components/ui/Aurora"
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect"

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: d, ease: [0.22, 1, 0.36, 1] as const } }),
}



const FEATURES = [
  { icon: Brain, title: "Stacked Ensemble", body: "LightGBM, XGBoost, MLP, and TabNet feed into a meta-learner \u2014 the same architecture used in top-tier production forecasting systems." },
  { icon: Map, title: "KMeans Geo-Clustering", body: "20 Bengaluru-specific clusters learned from real GPS corridors, police station zones, and arterial road data." },
  { icon: Zap, title: "Sub-Second Prediction", body: "Python FastAPI sidecar serving pre-trained .pkl models. Four severity classes with per-class probability output." },
  { icon: Shield, title: "Resource Recommendations", body: "Every prediction includes actionable deployment advice: police posts, diversion routes, peak-hour advisories." },
  { icon: GitBranch, title: "Event-Aware Features", body: "Encodes event type, cause, time-of-day, day-of-week, corridor flags, and vehicle mix \u2014 17 engineered features total." },
  { icon: TrendingUp, title: "Live History Tracking", body: "All predictions persist in-browser. Reviewable as a time-series table with severity distribution at a glance." },
]

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const progressScale = useTransform(scrollY, [0, 4000], [0, 1])
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setScrolled(latest > 50)
    })
  }, [scrollY])

  return (
    <SmoothScroll>
      {/* scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-50 origin-left"
        style={{ background: "var(--accent-signal)", scaleX: progressScale }}
      />

      {/* Floating Nav */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-6 pt-6 pointer-events-none">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`pointer-events-auto flex items-center justify-between px-6 py-3 border rounded-full backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] w-full max-w-4xl transition-colors duration-300 ${scrolled ? 'bg-[var(--bg-base)]/95 border-[var(--border-strong)]' : 'bg-[var(--bg-elevated)]/60 border-[var(--border-subtle)]'}`}
        >
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-1.5 h-1.5 rounded-full bg-[var(--data-live)] shadow-[0_0_8px_rgba(45,212,212,0.6)]"
            />
            <span className="text-[var(--text-primary)] font-semibold text-sm tracking-tight">ASTRAM</span>

          </div>

          <div className="flex items-center gap-6">
            <Link href="/model" className="hidden sm:block text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Model Details
            </Link>
            <Link href="/dashboard" className="group flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)] transition-colors bg-[var(--bg-elevated-2)] hover:bg-[var(--border-hover)] px-4 py-1.5 rounded-full">
              Open App
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </motion.header>
      </div>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 bg-[var(--bg-base)]">
        {/* Full-screen Aurora Background */}
        <div className="absolute inset-0 z-0 opacity-60 pointer-events-none" style={{ filter: "blur(30px)" }}>
          <Aurora
            colorStops={["#00ff87", "#B497CF", "#6100FF"]}
            blend={1.0}
            amplitude={2.0}
            speed={0.8}
          />
        </div>

        <RoadGrid />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[11px] text-[var(--text-secondary)] mb-8 tracking-wider uppercase">
            <span className="w-1 h-1 rounded-full bg-[var(--accent-signal)]" />
            Bengaluru Traffic Intelligence
          </motion.div>

          <motion.div custom={0.08} variants={fadeUp} initial="hidden" animate="show" className="relative mb-6">
            <h1 className="font-display text-[clamp(2.8rem,7vw,6rem)] font-bold tracking-[-0.03em] leading-[1.05] text-[var(--text-primary)] relative z-10 drop-shadow-lg">
              Predict congestion
            </h1>
            <div className="flex justify-center">
              <TypewriterEffectSmooth
                words={[
                  { text: "Before ", className: "text-[var(--accent-signal)] font-display text-[clamp(2.8rem,7vw,6rem)] font-bold tracking-[-0.03em] leading-[1.05] drop-shadow-lg" },
                  { text: " it ", className: "text-[var(--accent-signal)] font-display text-[clamp(2.8rem,7vw,6rem)] font-bold tracking-[-0.03em] leading-[1.05] drop-shadow-lg" },
                  { text: "happens.", className: "text-[var(--accent-signal)] font-display text-[clamp(2.8rem,7vw,6rem)] font-bold tracking-[-0.03em] leading-[1.05] drop-shadow-lg" },
                ]
                }
                className="justify-center"
                cursorClassName="bg-[var(--accent-signal)] h-[clamp(2.8rem,7vw,5.5rem)]"
              />
            </div>
          </motion.div>

          <motion.p custom={0.16} variants={fadeUp} initial="hidden" animate="show"
            className="text-[clamp(1.1rem,2.5vw,1.3rem)] text-[var(--text-secondary)] max-w-2xl mx-auto leading-[1.8] tracking-wide mb-10 relative z-10 font-light">
            Anticipate traffic gridlocks in Bengaluru before they occur. Our intelligent system analyzes real-time events to instantly recommend diversion routes and resource deployments.
          </motion.p>

          <motion.div custom={0.24} variants={fadeUp} initial="hidden" animate="show"
            className="flex items-center justify-center gap-3 flex-wrap pointer-events-auto">
            <Link href="/predict"
              className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-[var(--bg-base)] overflow-hidden transition-all duration-200 hover:shadow-[0_0_30px_rgba(242,169,59,0.35)] active:scale-[0.98] bg-[var(--accent-signal)] hover:bg-[var(--accent-signal-hover)]">
              Run a Prediction
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all duration-200 active:scale-[0.98]">
              View Dashboard
            </Link>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <button
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            className="cursor-pointer p-2 opacity-50 hover:opacity-100 transition-opacity"
            aria-label="Scroll down">
            <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-4 h-4 text-[var(--border-hover)]">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 3v10M4 9l4 4 4-4" />
              </svg>
            </motion.div>
          </button>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mb-14 text-center">
            <p className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-[0.18em] mb-3">Under the hood</p>
            <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-[-0.02em] text-[var(--text-primary)]">Built for real-world traffic</h2>
          </motion.div>
          <div className="relative w-full overflow-hidden flex py-10 -mx-6 px-6"
            style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
            <div className="flex gap-4 anim-marquee w-max group hover:anim-marquee-paused">
              {[...FEATURES, ...FEATURES].map(({ icon: Icon, title, body }, i) => (
                <div key={`${title}-${i}`} className="group/card relative w-[300px] shrink-0 p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--border-hover)] transition-colors cursor-default">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-elevated-2)]">
                      <Icon size={15} className="text-[var(--accent-signal)]" />
                    </div>

                    {/* Small data preview instead of generic icon */}
                    <div className="h-8 flex items-center justify-end text-[var(--text-tertiary)] opacity-60">
                      {title === "Stacked Ensemble" && (
                        <div className="flex gap-1 h-3">
                          <div className="w-4 bg-[var(--severity-low)] rounded-sm" />
                          <div className="w-3 bg-[var(--severity-medium)] rounded-sm" />
                          <div className="w-5 bg-[var(--severity-high)] rounded-sm" />
                          <div className="w-2 bg-[var(--severity-critical)] rounded-sm" />
                        </div>
                      )}
                      {title === "KMeans Geo-Clustering" && (
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)]" />
                          <span className="w-2 h-2 rounded-full bg-[var(--text-secondary)] -mt-1" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)]" />
                        </div>
                      )}
                      {title === "Sub-Second Prediction" && (
                        <span className="font-data text-[10px]">&lt;120ms</span>
                      )}
                      {title === "Resource Recommendations" && (
                        <div className="flex gap-1">
                          <span className="px-1.5 py-0.5 text-[8px] bg-[var(--border-subtle)] rounded uppercase">Officers</span>
                        </div>
                      )}
                      {title === "Event-Aware Features" && (
                        <div className="flex gap-0.5">
                          <span className="w-4 h-2 bg-[var(--accent-signal)] opacity-50 rounded-sm" />
                          <span className="w-2 h-2 bg-[var(--border-subtle)] rounded-sm" />
                        </div>
                      )}
                      {title === "Live History Tracking" && (
                        <div className="flex items-end gap-0.5 h-4">
                          <div className="w-1 h-2 bg-[var(--text-tertiary)]" />
                          <div className="w-1 h-4 bg-[var(--text-secondary)]" />
                          <div className="w-1 h-3 bg-[var(--text-tertiary)]" />
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 border-t border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mb-14 text-center">
            <p className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-[0.18em] mb-3">Pipeline</p>
            <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-[-0.02em] text-[var(--text-primary)]">Input to insight in 3 steps</h2>
          </motion.div>
          <div className="relative max-w-3xl mx-auto py-10">
            {/* Connecting Vertical Line */}
            <div className="absolute left-7 md:left-1/2 top-0 bottom-0 w-px bg-[var(--border-subtle)] -translate-x-1/2" />
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute left-7 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-[var(--accent-signal)] origin-top opacity-50"
            />

            <div className="flex flex-col gap-10">
              {[
                {
                  n: "01",
                  title: "Describe the event",
                  body: "Location, type, cause, time, corridor, police zone, vehicle mix \u2014 17 features total.",
                  preview: (
                    <div className="flex flex-col gap-2 p-3 bg-[var(--bg-elevated-2)] rounded border border-[var(--border-subtle)]">
                      <div className="flex justify-between items-center"><span className="text-[9px] uppercase text-[var(--text-tertiary)]">LATITUDE</span><span className="font-data text-[10px] text-[var(--text-secondary)]">12.9716</span></div>
                      <div className="h-px bg-[var(--border-subtle)]" />
                      <div className="flex justify-between items-center"><span className="text-[9px] uppercase text-[var(--text-tertiary)]">EVENT CAUSE</span><span className="font-data text-[10px] text-[var(--text-secondary)]">Public Event</span></div>
                    </div>
                  )
                },
                {
                  n: "02",
                  title: "Ensemble inference",
                  body: "4 base models score independently. Meta-learner blends outputs into a calibrated severity class + probability distribution.",
                  preview: (
                    <div className="flex gap-2 p-3 bg-[var(--bg-elevated-2)] rounded border border-[var(--border-subtle)] justify-center">
                      {["LGBM", "XGB", "MLP", "TAB"].map(m => (
                        <div key={m} className="px-1.5 py-1 text-[9px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded text-[var(--text-secondary)]">{m}</div>
                      ))}
                    </div>
                  )
                },
                {
                  n: "03",
                  title: "Act on the output",
                  body: "Severity badge, per-class probabilities, and specific resource deployment recommendations \u2014 ready to share.",
                  preview: (
                    <div className="flex items-center gap-3 p-3 bg-[var(--bg-elevated-2)] rounded border border-[var(--border-subtle)]">
                      <div className="px-2 py-1 rounded-full bg-[#e5484d]/10 border border-[#e5484d]/20 text-[#e5484d] text-[10px] font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e5484d]" /> CRITICAL
                      </div>
                      <span className="font-data text-xs text-[var(--text-primary)]">94.2%</span>
                    </div>
                  )
                },
              ].map(({ n, title, body, preview }, i) => (
                <motion.div key={n}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative flex items-center gap-6 md:gap-10 ${i % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"}`}
                >
                  {/* Preview side */}
                  <div className="hidden md:flex flex-1 items-center justify-center opacity-60">
                    <div className="w-48">
                      {preview}
                    </div>
                  </div>

                  {/* Node */}
                  <div className="relative z-10 flex shrink-0 items-center justify-center w-14 h-14 rounded-full border border-[var(--accent-signal)] bg-[var(--bg-elevated)] shadow-[0_0_15px_rgba(242,169,59,0.15)] group hover:shadow-[0_0_25px_rgba(242,169,59,0.25)] transition-shadow duration-500">
                    <span className="font-data text-base font-bold text-[var(--accent-signal)]">{n}</span>
                  </div>

                  {/* Content */}
                  <div className={`flex-1 pt-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-sm md:inline-block md:mx-auto md:mr-0">{body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl bg-[#09090b]/95 border border-white/[0.06] px-6 md:px-12 py-16 overflow-hidden">

            {/* SVG Background Pattern ([ + ] Matrix) */}
            <div className="absolute inset-0 pointer-events-none mix-blend-screen"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='10' y='10' width='20' height='20' fill='none' stroke='%23ffffff' stroke-width='0.5' stroke-opacity='0.055' rx='2' /%3E%3Cpath d='M20 17v6M17 20h6' stroke='%23ffffff' stroke-width='0.5' stroke-opacity='0.15'/%3E%3C/svg%3E")`, backgroundSize: '40px 40px' }} />

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />

            <div className="relative z-10">
              <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-[0.3em] mb-4 font-medium opacity-80">Try it now</p>
              <h2 className="font-display text-[clamp(1.5rem,3vw,2.2rem)] font-light tracking-wide text-white mb-12">
                Load a demo scenario
              </h2>

              <div className="flex flex-col md:flex-row justify-between items-center w-full mx-auto gap-4 md:gap-0">
                {[
                  {
                    label: "Cricket at Chinnaswamy", tag: "Critical", color: "#e5484d",
                    icon: (
                      <div className="text-slate-400 group-hover:text-white transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                          <path d="M4 22h16" />
                          <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                          <path d="M12 2a6 6 0 0 1 6 6v1c0 2.2-1.8 4-4 4h-4a4 4 0 0 1-4-4V8a6 6 0 0 1 6-6z" />
                        </svg>
                      </div>
                    )
                  },
                  {
                    label: "Breakdown on ORR", tag: "High", color: "#f2873b",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-white transition-colors duration-300">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                      </svg>
                    )
                  },
                  {
                    label: "Procession in CBD", tag: "Medium", color: "#f2a93b",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-white transition-colors duration-300">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    )
                  },
                  {
                    label: "Road Work Off Peak", tag: "Low", color: "#34c77b",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-white transition-colors duration-300">
                        <path d="m10.5 2 7.5 18" />
                        <path d="M13.5 2 6 20" />
                        <path d="M3 20h18" />
                        <path d="M8 10h8" />
                        <path d="M7 14h10" />
                      </svg>
                    )
                  },
                ].map((demo, i) => (
                  <div key={demo.label} className="flex flex-1 items-center justify-center relative w-full group">
                    <Link href={`/predict?demo=${encodeURIComponent(demo.label)}`}
                      className="flex flex-col items-center md:items-start text-center md:text-left gap-3 w-full max-w-[200px] p-5 rounded-xl transition-all duration-300 ease-in-out hover:bg-white/[0.02]"
                    >
                      {demo.icon}
                      <div className="flex flex-col gap-1.5 mt-2">
                        <h3 className="text-[13px] font-medium text-slate-300 group-hover:text-white transition-colors tracking-wide">{demo.label}</h3>
                        <div className="flex items-center justify-center md:justify-start gap-2 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="w-[5px] h-[5px] rounded-full" style={{ background: demo.color }} />
                          <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-slate-500">{demo.tag} SEVERITY</span>
                        </div>
                      </div>
                    </Link>
                    {/* Vertical Divider */}
                    {i < 3 && (
                      <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-12 bg-white/[0.04]" />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-12">
                <Link href="/predict"
                  className="group relative inline-flex items-center gap-3 px-8 py-2.5 rounded-full text-xs font-medium text-slate-400 overflow-hidden transition-all duration-300 border border-white/10 bg-transparent hover:bg-white/5 hover:text-white hover:border-white/20">
                  <span className="relative z-10 transition-colors duration-300">Start from scratch</span>
                  <ArrowRight size={13} className="relative z-10 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.04] bg-[#000000] py-6 px-8 relative z-20">
        <div className="flex items-center justify-between w-full max-w-none">
          {/* Logo block */}
          <div className="flex items-center group">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-slate-500 group-hover:text-white transition-colors duration-300 cursor-pointer">
              <path d="M4 2v20h4V8l10 14h4V2h-4v14L8 2H4z" />
            </svg>
          </div>

          {/* Text block */}
          <div className="flex items-center gap-3 text-[10px] tracking-wider text-slate-500 font-medium">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">ASTRAM Gridlock — Bengaluru Traffic Intelligence</span>
            <span className="text-slate-800">|</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Flipkart GridLock</span>
          </div>
        </div>
      </footer>
    </SmoothScroll>
  )
}
