"use client"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import SmoothScroll from "@/components/providers/SmoothScroll"
import { Brain, GitBranch, Map, Zap, Shield, TrendingUp, ArrowRight, ChevronRight } from "lucide-react"

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: d, ease: [0.22, 1, 0.36, 1] as const } }),
}

const STATS = [
  { value: "96.2%", label: "Prediction Accuracy" },
  { value: "4",     label: "Base ML Models" },
  { value: "20",    label: "Geo Clusters" },
  { value: "<120ms",label: "Inference Latency" },
]

const FEATURES = [
  { icon: Brain,      title: "Stacked Ensemble",       body: "LightGBM, XGBoost, MLP, and TabNet feed into a meta-learner — the same architecture used in top-tier production forecasting systems." },
  { icon: Map,        title: "KMeans Geo-Clustering",  body: "20 Bengaluru-specific clusters learned from real GPS corridors, police station zones, and arterial road data." },
  { icon: Zap,        title: "Sub-Second Prediction",  body: "Python FastAPI sidecar serving pre-trained .pkl models. Four severity classes with per-class probability output." },
  { icon: Shield,     title: "Resource Recommendations", body: "Every prediction includes actionable deployment advice: police posts, diversion routes, peak-hour advisories." },
  { icon: GitBranch,  title: "Event-Aware Features",   body: "Encodes event type, cause, time-of-day, day-of-week, corridor flags, and vehicle mix — 17 engineered features total." },
  { icon: TrendingUp, title: "Live History Tracking",  body: "All predictions persist in-browser. Reviewable as a time-series table with severity distribution at a glance." },
]

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const blobY = useTransform(scrollY, [0, 600], [0, -80])
  const progressScale = useTransform(scrollY, [0, 4000], [0, 1])

  return (
    <SmoothScroll>
      {/* scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-50 origin-left"
        style={{ background: "linear-gradient(to right, #7C3AED, #06B6D4)", scaleX: progressScale }}
      />

      {/* Nav */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center px-6 border-b border-white/[0.06] backdrop-blur-md bg-[#0A0A0F]/80"
      >
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-1.5 h-1.5 rounded-full bg-violet-500"
            />
            <span className="text-[#F5F5F7] font-semibold text-sm tracking-tight">ASTRAM</span>
            <span className="text-white/30 text-sm">/</span>
            <span className="text-white/40 text-sm font-light">Gridlock</span>
          </div>
          <Link href="/dashboard" className="group flex items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white/90 transition-colors">
            Open App
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </motion.header>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
        <motion.div style={{ y: blobY }} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.08] blur-[120px]"
            style={{ background: "radial-gradient(circle, #7C3AED, transparent 70%)" }} />
          <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.06] blur-[100px]"
            style={{ background: "radial-gradient(circle, #06B6D4, transparent 70%)" }} />
        </motion.div>

        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "200px 200px" }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-[11px] text-white/50 mb-8 tracking-wider uppercase">
            <span className="w-1 h-1 rounded-full bg-violet-400" />
            Bengaluru Traffic Intelligence
          </motion.div>

          <motion.h1 custom={0.08} variants={fadeUp} initial="hidden" animate="show"
            className="text-[clamp(2.8rem,7vw,6rem)] font-bold tracking-[-0.03em] leading-[1.05] text-[#F5F5F7] mb-6">
            Predict congestion.
            <br />
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
              Before it happens.
            </span>
          </motion.h1>

          <motion.p custom={0.16} variants={fadeUp} initial="hidden" animate="show"
            className="text-[clamp(1rem,2vw,1.2rem)] text-white/45 max-w-xl mx-auto leading-relaxed mb-10">
            Event-driven severity classification for Bengaluru using a stacked ensemble of
            LightGBM, XGBoost, MLP, and TabNet. Input to recommendation in under 120ms.
          </motion.p>

          <motion.div custom={0.24} variants={fadeUp} initial="hidden" animate="show"
            className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/predict"
              className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white overflow-hidden transition-all duration-200 hover:shadow-[0_0_30px_rgba(124,58,237,0.35)] active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
              Run a Prediction
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-white/60 border border-white/10 hover:border-white/20 hover:text-white/80 transition-all duration-200 active:scale-[0.98]">
              View Dashboard
            </Link>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-4 h-4 text-white/20">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 3v10M4 9l4 4 4-4" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-white/[0.06]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06]">
          {STATS.map(({ value, label }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#0A0A0F] px-8 py-8 flex flex-col gap-1">
              <span className="text-[clamp(1.8rem,4vw,2.4rem)] font-bold tracking-tight tabular-nums text-[#F5F5F7]">{value}</span>
              <span className="text-xs text-white/35 uppercase tracking-wider">{label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mb-14 text-center">
            <p className="text-[11px] text-white/30 uppercase tracking-[0.18em] mb-3">Under the hood</p>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-[-0.02em] text-[#F5F5F7]">Built for real-world traffic</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, body }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-6 rounded-xl border border-white/[0.07] bg-[#111118] hover:border-white/[0.14] transition-colors">
                <div className="w-8 h-8 rounded-lg mb-4 flex items-center justify-center border border-white/[0.08]"
                  style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))" }}>
                  <Icon size={15} className="text-violet-400" />
                </div>
                <h3 className="text-sm font-semibold text-[#F5F5F7] mb-2">{title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mb-14 text-center">
            <p className="text-[11px] text-white/30 uppercase tracking-[0.18em] mb-3">Pipeline</p>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-[-0.02em] text-[#F5F5F7]">Input to insight in 3 steps</h2>
          </motion.div>
          <div className="relative">
            <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { n: "01", title: "Describe the event", body: "Location, type, cause, time, corridor, police zone, vehicle mix — 17 features total." },
                { n: "02", title: "Ensemble inference", body: "4 base models score independently. Meta-learner blends outputs into a calibrated severity class + probability distribution." },
                { n: "03", title: "Act on the output", body: "Severity badge, per-class probabilities, and specific resource deployment recommendations — ready to share." },
              ].map(({ n, title, body }, i) => (
                <motion.div key={n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-white/[0.08] bg-[#111118] mb-5">
                    <span className="text-base font-bold tabular-nums text-transparent bg-clip-text"
                      style={{ backgroundImage: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>{n}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#F5F5F7] mb-2">{title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl border border-white/[0.08] bg-[#111118] px-12 py-16 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-20"
              style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.4), transparent 60%)" }} />
            <div className="relative z-10">
              <p className="text-[11px] text-white/30 uppercase tracking-[0.18em] mb-4">Try it now</p>
              <h2 className="text-[clamp(1.6rem,4vw,2.6rem)] font-bold tracking-[-0.02em] text-[#F5F5F7] mb-3">
                See it predict a real scenario
              </h2>
              <p className="text-sm text-white/40 mb-8 max-w-md mx-auto leading-relaxed">
                Load one of four demo presets — cricket match at Chinnaswamy, ORR breakdown, procession, or road work — and get a severity prediction instantly.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link href="/predict"
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:shadow-[0_0_30px_rgba(124,58,237,0.35)] active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
                  Run a Prediction
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/model"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-white/50 border border-white/10 hover:border-white/20 hover:text-white/70 transition-all duration-200">
                  View Model Metrics
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-[11px] text-white/25">
          <span>ASTRAM Gridlock — Bengaluru Traffic Intelligence</span>
          <span>Flipkart Grid 7.0</span>
        </div>
      </footer>
    </SmoothScroll>
  )
}
