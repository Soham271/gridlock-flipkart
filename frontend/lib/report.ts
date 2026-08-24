import { HistoryEntry } from "@/types"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const MONTHS = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"]

const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string))

const dash = (v: unknown) =>
  v === null || v === undefined || v === "" ? "—" : esc(v)

/** `key: value` rows, rendered as a two-column table. */
function rows(pairs: [string, unknown][]) {
  return pairs
    .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${dash(v)}</td></tr>`)
    .join("")
}

function buildHTML(entry: HistoryEntry): string {
  const i = entry.input
  const r = entry.recommendations
  const generated = new Date()
  const issued = new Date(entry.timestamp)

  const hh = String(i.start_hour).padStart(2, "0")
  const mm = String(i.start_minute ?? 0).padStart(2, "0")

  const probs = Object.entries(entry.class_probabilities)
    .sort((a, b) => b[1] - a[1])
    .map(([label, p]) => `
      <tr>
        <td>${esc(label)}</td>
        <td class="num">${(p * 100).toFixed(2)}%</td>
        <td class="num">${p.toFixed(4)}</td>
      </tr>`)
    .join("")

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Congestion Report ${esc(entry.id)}</title>
<style>
  @page { size: A4; margin: 13mm 14mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 10.5pt; line-height: 1.4; color: #000; background: #fff; margin: 0;
  }
  h1 { font-size: 15pt; margin: 0 0 2pt; letter-spacing: .01em; }
  h2 {
    font-size: 10pt; margin: 11pt 0 4pt; text-transform: uppercase;
    letter-spacing: .09em; border-bottom: 1px solid #000; padding-bottom: 2pt;
  }
  .sub { font-size: 9pt; margin: 0; }
  .rule { border-top: 2px solid #000; margin: 7pt 0 0; }
  .meta {
    display: flex; gap: 24pt; flex-wrap: wrap;
    font-family: "Courier New", monospace; font-size: 8.5pt; margin-top: 6pt;
  }
  table { width: 100%; border-collapse: collapse; margin-top: 3pt; }
  th, td { text-align: left; padding: 2.4pt 6pt; vertical-align: top; border-bottom: 1px solid #ccc; }
  th { width: 34%; font-weight: normal; color: #333; }
  td { font-weight: 500; }
  .num { font-family: "Courier New", monospace; text-align: right; font-variant-numeric: tabular-nums; }
  table.data th { width: auto; font-weight: bold; color: #000; border-bottom: 1px solid #000; }
  .verdict { border: 2px solid #000; padding: 8pt 10pt; margin-top: 4pt; }
  .verdict .lbl { font-size: 8.5pt; text-transform: uppercase; letter-spacing: .09em; }
  .verdict .val { font-size: 20pt; font-weight: bold; line-height: 1.1; }
  .verdict .cf { font-family: "Courier New", monospace; font-size: 9pt; }
  .sign { margin-top: 8pt; display: flex; gap: 30pt; font-size: 9pt; }
  .sign div { flex: 1; border-top: 1px solid #000; padding-top: 3pt; }
  .foot { margin-top: 9pt; border-top: 1px solid #000; padding-top: 5pt; font-size: 8pt; color: #333; }
  .cols { display: flex; gap: 18pt; }
  .cols > * { flex: 1; min-width: 0; }
</style></head><body>

<h1>Traffic Congestion Severity Report</h1>
<p class="sub">ASTRAM Gridlock — event-driven congestion prediction and resource recommendation</p>
<div class="rule"></div>
<div class="meta">
  <span>REPORT ID: ${esc(entry.id)}</span>
  <span>ANALYSED: ${esc(issued.toLocaleString())}</span>
  <span>GENERATED: ${esc(generated.toLocaleString())}</span>
</div>

<h2>1. Event Details</h2>
<div class="cols">
  <table>${rows([
    ["Event type", i.event_type],
    ["Event cause", String(i.event_cause).replace(/_/g, " ")],
    ["Start time", `${hh}:${mm}`],
    ["Day of week", DAYS[i.day_of_week] ?? i.day_of_week],
    ["Date", `${i.day} ${MONTHS[i.month - 1] ?? ""}`],
    ["Expected duration", i.duration_mins != null ? `${i.duration_mins} minutes` : null],
  ])}</table>
  <table>${rows([
    ["Latitude", i.latitude.toFixed(6)],
    ["Longitude", i.longitude.toFixed(6)],
    ["Corridor", i.corridor],
    ["Police station", i.police_station],
    ["Zone", i.zone],
    ["Junction", i.junction],
    ["Vehicle type", i.veh_type],
  ])}</table>
</div>

<h2>2. Predicted Severity</h2>
<div class="verdict">
  <div class="lbl">Severity level ${entry.severity_level} of 3</div>
  <div class="val">${esc(entry.severity_label.toUpperCase())}</div>
  <div class="cf">Model confidence: ${(entry.confidence * 100).toFixed(2)}%
    &nbsp;·&nbsp; Location cluster: ${entry.location_cluster}
    &nbsp;·&nbsp; Priority flag: ${esc(r.priority_flag)}</div>
</div>

<h2>3. Class Probabilities</h2>
<table class="data">
  <thead><tr><th>Severity class</th><th class="num">Probability</th><th class="num">Value</th></tr></thead>
  <tbody>${probs}</tbody>
</table>

<h2>4. Resource Recommendation</h2>
<table>${rows([
  ["Manpower required", `${r.manpower_min} – ${r.manpower_max} officers`],
  ["Barricading", r.barricading],
  ["Diversion", r.diversion],
  ["Estimated impact", `${r.impact_minutes} minutes`],
  ["Pre-deployment", r.pre_deploy],
  ["Peak-hour note", r.peak_note],
  ["Special action", r.special_action],
])}</table>

<div class="sign">
  <div>Prepared by (name &amp; rank)</div>
  <div>Signature</div>
  <div>Date</div>
</div>

<div class="foot">
  Generated by the ASTRAM Gridlock stacked ensemble (LightGBM · XGBoost · MLP · TabNet → LightGBM meta-learner),
  with resource figures from a deterministic rule table adjusted for corridor and peak-hour context.
  This is decision-support output and does not replace on-site assessment by the officer in charge.
</div>

</body></html>`
}

/**
 * Opens the browser print dialog on a plain, data-only report for this
 * prediction. Choosing "Save as PDF" there produces the downloadable file.
 */
export function downloadReport(entry: HistoryEntry) {
  const frame = document.createElement("iframe")
  frame.setAttribute("aria-hidden", "true")
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden"
  document.body.appendChild(frame)

  const cleanup = () => {
    // Give the print dialog time to take its snapshot before detaching.
    setTimeout(() => frame.remove(), 1000)
  }

  frame.onload = () => {
    const win = frame.contentWindow
    if (!win) { frame.remove(); return }
    win.focus()
    win.print()
    if ("onafterprint" in win) win.onafterprint = cleanup
    else cleanup()
  }

  const doc = frame.contentDocument
  if (!doc) { frame.remove(); return }
  doc.open()
  doc.write(buildHTML(entry))
  doc.close()
}
