"use client"
import { useEffect, useMemo, useState } from "react"
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react"

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5)

export interface DateTimeValue {
  month: number
  day: number
  start_hour: number
  start_minute: number
  day_of_week: number
}

interface Props {
  value: DateTimeValue
  onChange: (v: DateTimeValue) => void
  confirmed: boolean
  onConfirmedChange: (confirmed: boolean) => void
  error?: string | null
}

type PopupStep = "date" | "hour" | "minute"

function toFormWeekday(jsDay: number) {
  return jsDay === 0 ? 6 : jsDay - 1
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}

function formatDisplay(month: number, day: number, year: number, h: number, m: number) {
  const period = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  return `${day} ${MONTHS[month - 1].slice(0, 3)} ${year} · ${h12}:${pad(m)} ${period}`
}

export function buildEventDateTime(v: DateTimeValue, year = new Date().getFullYear()) {
  return new Date(year, v.month - 1, v.day, v.start_hour, v.start_minute ?? 0, 0, 0)
}

export function isDateTimeInPast(v: DateTimeValue, year = new Date().getFullYear()) {
  return buildEventDateTime(v, year).getTime() < Date.now()
}

function calendarDays(year: number, month: number) {
  const first = new Date(year, month - 1, 1)
  const startPad = first.getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: { day: number; inMonth: boolean; month: number; year: number }[] = []

  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const prevDays = new Date(year, month - 1, 0).getDate()
  for (let i = startPad - 1; i >= 0; i--) {
    cells.push({ day: prevDays - i, inMonth: false, month: prevMonth, year: prevYear })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true, month, year })
  }
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  let next = 1
  while (cells.length % 7 !== 0) {
    cells.push({ day: next++, inMonth: false, month: nextMonth, year: nextYear })
  }
  return cells
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function to24Hour(h12: number, am: boolean) {
  if (am) return h12 === 12 ? 0 : h12
  return h12 === 12 ? 12 : h12 + 12
}

function AndroidClockHand({ angleDeg, length = 72 }: { angleDeg: number; length?: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        className="absolute bottom-1/2 left-1/2 w-[2px] origin-bottom rounded-full bg-[var(--accent-signal)]"
        style={{
          height: length,
          transform: `translateX(-50%) rotate(${angleDeg}deg)`,
        }}
      />
      <div className="absolute w-2.5 h-2.5 rounded-full bg-[var(--accent-signal)]" />
    </div>
  )
}

export default function EventDateTimePicker({
  value,
  onChange,
  confirmed,
  onConfirmedChange,
  error,
}: Props) {
  const now = new Date()
  const todayStart = startOfDay(now)

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<PopupStep>("date")
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(value.month || now.getMonth() + 1)
  const [popupError, setPopupError] = useState<string | null>(null)

  const [draftDay, setDraftDay] = useState(value.day)
  const [draftMonth, setDraftMonth] = useState(value.month)
  const [draftYear, setDraftYear] = useState(now.getFullYear())
  const [draftWeekday, setDraftWeekday] = useState(value.day_of_week)
  const [draftHour12, setDraftHour12] = useState(value.start_hour % 12 || 12)
  const [draftAm, setDraftAm] = useState(value.start_hour < 12)
  const [draftMinute, setDraftMinute] = useState(Math.round((value.start_minute ?? 0) / 5) * 5)

  useEffect(() => {
    if (open) return
    setViewMonth(value.month)
    setViewYear(now.getFullYear())
  }, [value.month, open])

  const openPopup = () => {
    setDraftDay(value.day)
    setDraftMonth(value.month)
    setDraftYear(now.getFullYear())
    setDraftWeekday(value.day_of_week)
    setDraftHour12(value.start_hour % 12 || 12)
    setDraftAm(value.start_hour < 12)
    setDraftMinute(Math.round((value.start_minute ?? 0) / 5) * 5)
    setViewYear(now.getFullYear())
    setViewMonth(value.month || now.getMonth() + 1)
    setStep("date")
    setPopupError(null)
    setOpen(true)
  }

  const days = useMemo(() => calendarDays(viewYear, viewMonth), [viewYear, viewMonth])

  const isDateDisabled = (day: number, month: number, year: number) => {
    const d = new Date(year, month - 1, day)
    return d < todayStart
  }

  const isSameDayAsToday = (day: number, month: number, year: number) =>
    day === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear()

  const draftDateTime = () =>
    buildEventDateTime(
      {
        month: draftMonth,
        day: draftDay,
        start_hour: to24Hour(draftHour12, draftAm),
        start_minute: draftMinute,
        day_of_week: draftWeekday,
      },
      draftYear,
    )

  const isHourDisabled = (h12: number, am: boolean) => {
    if (!isSameDayAsToday(draftDay, draftMonth, draftYear)) return false
    const h24 = to24Hour(h12, am)
    return h24 < now.getHours()
  }

  const isMinuteDisabled = (minute: number) => {
    if (!isSameDayAsToday(draftDay, draftMonth, draftYear)) return false
    const h24 = to24Hour(draftHour12, draftAm)
    if (h24 > now.getHours()) return false
    if (h24 < now.getHours()) return true
    return minute < Math.ceil(now.getMinutes() / 5) * 5
  }

  const selectDate = (day: number, month: number, year: number, inMonth: boolean) => {
    if (isDateDisabled(day, month, year)) return
    if (!inMonth) {
      setViewMonth(month)
      setViewYear(year)
    }
    const d = new Date(year, month - 1, day)
    setDraftDay(day)
    setDraftMonth(month)
    setDraftYear(year)
    setDraftWeekday(toFormWeekday(d.getDay()))
    setPopupError(null)
  }

  const goToHour = () => {
    if (isDateDisabled(draftDay, draftMonth, draftYear)) {
      setPopupError("Please select a valid future date")
      return
    }
    setStep("hour")
    setPopupError(null)
  }

  const goToMinute = () => {
    if (isHourDisabled(draftHour12, draftAm)) {
      setPopupError("This hour has already passed today")
      return
    }
    setStep("minute")
    setPopupError(null)
  }

  const confirmAll = () => {
    if (isMinuteDisabled(draftMinute)) {
      setPopupError("Time must be now or in the future")
      return
    }
    if (draftDateTime().getTime() < Date.now()) {
      setPopupError("Date & time must be now or in the future")
      return
    }
    onChange({
      month: draftMonth,
      day: draftDay,
      start_hour: to24Hour(draftHour12, draftAm),
      start_minute: draftMinute,
      day_of_week: draftWeekday,
    })
    onConfirmedChange(true)
    setOpen(false)
    setPopupError(null)
  }

  const hourHandAngle = (draftHour12 % 12) * 30
  const minuteHandAngle = (draftMinute / 60) * 360

  const displayYear = now.getFullYear()

  return (
    <>
      <button
        type="button"
        onClick={openPopup}
        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors
          ${error
            ? "border-[var(--severity-critical)] bg-[var(--severity-critical)]/5"
            : confirmed
              ? "border-[var(--border-subtle)] bg-[var(--bg-base)] hover:border-[var(--accent-signal)]"
              : "border-[var(--accent-signal)]/40 bg-[var(--bg-base)] hover:border-[var(--accent-signal)]"
          }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Calendar size={16} className="text-[var(--text-secondary)] shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">
              Date &amp; time {confirmed ? "" : <span className="text-[var(--accent-signal)]">*</span>}
            </p>
            <p className={`text-sm truncate ${confirmed ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-tertiary)]"}`}>
              {confirmed
                ? formatDisplay(value.month, value.day, displayYear, value.start_hour, value.start_minute ?? 0)
                : "Tap to select date & time"}
            </p>
          </div>
        </div>
        <ChevronRight size={18} className="text-[var(--text-secondary)] shrink-0" />
      </button>

      {(error || popupError) && !open && error && (
        <p className="text-[10px] text-[var(--severity-critical)] mt-1.5">{error}</p>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full sm:max-w-[340px] rounded-t-2xl sm:rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--bg-elevated)] z-10">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {step === "date" && "Select date"}
                  {step === "hour" && "Select hour"}
                  {step === "minute" && "Select minutes"}
                </p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                  Step {step === "date" ? 1 : step === "hour" ? 2 : 3} of 3
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated-2)] text-[var(--text-secondary)]">
                <X size={18} />
              </button>
            </div>

            {popupError && (
              <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-[var(--severity-critical)]/10 border border-[var(--severity-critical)]/20 text-[11px] text-[var(--severity-critical)]">
                {popupError}
              </div>
            )}

            {/* STEP 1 — Calendar */}
            {step === "date" && (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => {
                    const d = new Date(viewYear, viewMonth - 2, 1)
                    setViewYear(d.getFullYear())
                    setViewMonth(d.getMonth() + 1)
                  }} className="p-2 rounded-full hover:bg-[var(--bg-elevated-2)] text-[var(--text-secondary)]">
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {MONTHS[viewMonth - 1]} {viewYear}
                  </span>
                  <button type="button" onClick={() => {
                    const d = new Date(viewYear, viewMonth, 1)
                    setViewYear(d.getFullYear())
                    setViewMonth(d.getMonth() + 1)
                  }} className="p-2 rounded-full hover:bg-[var(--bg-elevated-2)] text-[var(--text-secondary)]">
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {WEEKDAYS.map(w => (
                    <div key={w} className="text-center text-[10px] text-[var(--text-tertiary)] py-1">{w}</div>
                  ))}
                  {days.map((cell, i) => {
                    const disabled = isDateDisabled(cell.day, cell.month, cell.year)
                    const selected = cell.inMonth && cell.day === draftDay && cell.month === draftMonth && cell.year === draftYear
                    const isToday = isSameDayAsToday(cell.day, cell.month, cell.year)
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={disabled}
                        onClick={() => selectDate(cell.day, cell.month, cell.year, cell.inMonth)}
                        className={`aspect-square rounded-full text-xs font-data transition-all
                          ${disabled ? "opacity-30 cursor-not-allowed text-[var(--text-tertiary)]" : ""}
                          ${selected
                            ? "bg-[var(--accent-signal)] text-[var(--bg-base)] font-bold scale-105"
                            : isToday && !disabled
                              ? "ring-1 ring-[var(--accent-signal)] text-[var(--accent-signal)]"
                              : cell.inMonth
                                ? "text-[var(--text-primary)] hover:bg-[var(--bg-elevated-2)]"
                                : "text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated-2)]"
                          }`}
                      >
                        {cell.day}
                      </button>
                    )
                  })}
                </div>

                <button type="button" onClick={goToHour} className=" flex justify-center items-center w-full btn-primary py-3 text-sm mt-2">
                  Next — set time
                </button>
              </div>
            )}

            {/* STEP 2 & 3 — Time Picker */}
            {(step === "hour" || step === "minute") && (
              <div className="p-4 space-y-6">
                <div className="flex justify-center items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep("hour")}
                    className={`text-5xl font-light rounded-xl px-4 py-3 transition-colors ${step === "hour"
                      ? "bg-[var(--accent-signal)]/20 text-[var(--accent-signal)]"
                      : "bg-[var(--bg-elevated-2)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated-3)]"
                      }`}
                  >
                    {pad(draftHour12)}
                  </button>
                  <span className="text-5xl font-light text-[var(--text-secondary)] opacity-50">:</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (isHourDisabled(draftHour12, draftAm)) {
                        setPopupError("This hour has already passed today")
                        return
                      }
                      setStep("minute")
                      setPopupError(null)
                    }}
                    className={`text-5xl font-light rounded-xl px-4 py-3 transition-colors ${step === "minute"
                      ? "bg-[var(--accent-signal)]/20 text-[var(--accent-signal)]"
                      : "bg-[var(--bg-elevated-2)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated-3)]"
                      }`}
                  >
                    {pad(draftMinute)}
                  </button>
                  <div className="flex flex-col gap-1.5 ml-2">
                    {([true, false] as const).map(am => (
                      <button
                        key={am ? "am" : "pm"}
                        type="button"
                        onClick={() => { setDraftAm(am); setPopupError(null) }}
                        className={`px-3.5 py-2 rounded-lg text-[11px] font-bold tracking-wider transition-all border
                          ${draftAm === am
                            ? "bg-[var(--accent-signal)]/20 border-[var(--accent-signal)]/50 text-[var(--accent-signal)]"
                            : "bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated-2)]"
                          }`}
                      >
                        {am ? "AM" : "PM"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative mx-auto w-[260px] h-[260px] rounded-full bg-[var(--bg-elevated-2)]/50 border border-[var(--border-subtle)] shadow-inner">
                  <AndroidClockHand
                    angleDeg={step === "hour" ? hourHandAngle : minuteHandAngle}
                    length={98}
                  />
                  {step === "hour" ? (
                    Array.from({ length: 12 }, (_, i) => {
                      const h = i + 1
                      const angle = (h / 12) * 2 * Math.PI - Math.PI / 2
                      const r = 98
                      const cx = 130 + r * Math.cos(angle)
                      const cy = 130 + r * Math.sin(angle)
                      const active = draftHour12 === h
                      const disabled = isHourDisabled(h, draftAm)
                      return (
                        <button
                          key={h}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            setDraftHour12(h)
                            setPopupError(null)
                            setTimeout(() => setStep("minute"), 150)
                          }}
                          className={`absolute w-10 h-10 rounded-full text-sm font-semibold -translate-x-1/2 -translate-y-1/2 transition-all
                            ${disabled ? "opacity-25 cursor-not-allowed" : ""}
                            ${active
                              ? "bg-[var(--accent-signal)] text-[var(--bg-base)] z-10"
                              : "text-[var(--text-primary)] hover:bg-[var(--bg-elevated-2)]"
                            }`}
                          style={{ left: cx, top: cy }}
                        >
                          {h}
                        </button>
                      )
                    })
                  ) : (
                    MINUTES.map((m, i) => {
                      const angle = (i / 12) * 2 * Math.PI - Math.PI / 2
                      const r = 98
                      const cx = 130 + r * Math.cos(angle)
                      const cy = 130 + r * Math.sin(angle)
                      const active = draftMinute === m
                      const disabled = isMinuteDisabled(m)
                      return (
                        <button
                          key={m}
                          type="button"
                          disabled={disabled}
                          onClick={() => { setDraftMinute(m); setPopupError(null) }}
                          className={`absolute w-10 h-10 rounded-full text-xs font-data -translate-x-1/2 -translate-y-1/2 transition-all
                            ${disabled ? "opacity-25 cursor-not-allowed" : ""}
                            ${active
                              ? "bg-[var(--accent-signal)] text-[var(--bg-base)] font-bold z-10"
                              : "text-[var(--text-primary)] hover:bg-[var(--bg-elevated-2)]"
                            }`}
                          style={{ left: cx, top: cy }}
                        >
                          {pad(m)}
                        </button>
                      )
                    })
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setStep(step === "hour" ? "date" : "hour")} className="flex-1 py-2.5 text-sm rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                    Back
                  </button>
                  <button type="button" onClick={step === "hour" ? goToMinute : confirmAll} className="flex-1 flex justify-center items-center btn-primary py-2.5 text-sm ">
                    {step === "hour" ? "Next — minutes" : "Confirm"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
