"""Generates the ASTRAM Gridlock B.Tech final-evaluation presentation.

Light theme throughout, including the title and closing slides. ML concepts
and the backend request flow are drawn as native PowerPoint shapes so every
element stays editable in PowerPoint / Google Slides.

    python build_deck.py        (needs: python-pptx, Pillow)
"""
from pathlib import Path
from pptx import Presentation
from pptx.util import Inches as In, Pt, Emu
from pptx.dml.color import RGBColor as C
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from PIL import Image

ROOT   = Path(__file__).resolve().parents[2]
CHARTS = ROOT / "frontend" / "public" / "model-charts"
OUT    = Path(__file__).resolve().parent

INK    = C(0x1A, 0x1F, 0x2E)
ACCENT = C(0xC2, 0x6A, 0x02)
MUTED  = C(0x5B, 0x64, 0x78)
FAINT  = C(0x8A, 0x93, 0xA3)
RULE   = C(0xD8, 0xDC, 0xE3)
PANEL  = C(0xF4, 0xF5, 0xF7)
WHITE  = C(0xFF, 0xFF, 0xFF)
GOOD   = C(0x1B, 0x7F, 0x4B)
BAD    = C(0xB0, 0x2A, 0x37)
BLUE   = C(0x2B, 0x59, 0x8A)
BLUEBG = C(0xE4, 0xED, 0xF6)
BLUEED = C(0xA8, 0xC0, 0xDC)
GRNBG  = C(0xE8, 0xF1, 0xE9)
GRNED  = C(0x9C, 0xC0, 0xA6)
AMBBG  = C(0xFD, 0xF0, 0xE2)
AMBED  = C(0xE5, 0xC2, 0x92)
REDBG  = C(0xFD, 0xF2, 0xF2)
REDED  = C(0xE8, 0xB4, 0xB8)
PURBG  = C(0xF3, 0xF0, 0xF8)
PURED  = C(0xC4, 0xB8, 0xD4)
PURTX  = C(0x56, 0x51, 0x7E)

W, H = 13.333, 7.5
M = 0.72
FONT = "Calibri"
MONO = "Consolas"

TEAM = [("Aman Kumar", "2023IMT-010"),
        ("Viswajit Sarak Patil", "2023IMT-071"),
        ("Sahil Pal", "2023IMT-069")]

prs = Presentation()
prs.slide_width, prs.slide_height = In(W), In(H)
BLANK = prs.slide_layouts[6]


# ───────────────────────────── primitives ─────────────────────────────
def box(sl, x, y, w, h, fill=None, line=None, lw=1.0, shape=MSO_SHAPE.RECTANGLE):
    s = sl.shapes.add_shape(shape, In(x), In(y), In(w), In(h))
    if fill is None:
        s.fill.background()
    else:
        s.fill.solid(); s.fill.fore_color.rgb = fill
    if line is None:
        s.line.fill.background()
    else:
        s.line.color.rgb = line; s.line.width = Pt(lw)
    s.shadow.inherit = False
    return s


BOXES = []          # (slide_no, x, y, w, declared_h, est_h, preview)


def _est_height(runs, w, size, font, line, space):
    """Rough wrapped-text height in inches, honouring explicit line breaks."""
    paras = [runs] if isinstance(runs, str) else runs
    total = 0.0
    for para in paras:
        chunks = [(para, {})] if isinstance(para, str) else para
        maxsize = max([o.get("size", size) for _, o in chunks] or [size])
        # average per-character width across the paragraph's runs
        chars = sum(len(t) for t, _ in chunks) or 1
        wpt = sum(len(t) * o.get("size", size) *
                  (0.55 if o.get("font", font) == MONO else 0.48) for t, o in chunks)
        per = wpt / chars
        avail = w * 72
        lines = 0
        for seg in "".join(t for t, _ in chunks).split("\n"):
            lines += max(1, -(-int(len(seg) * per) // int(avail)))
        total += lines * maxsize * 1.2 * line + space
    return (total - space) / 72.0


def text(sl, x, y, w, h, runs, size=14, color=INK, bold=False, align=PP_ALIGN.LEFT,
         font=FONT, space=6, line=1.25, anchor=MSO_ANCHOR.TOP, italic=False):
    _flat = runs if isinstance(runs, str) else " ".join(
        t for p in runs for t, _ in ([(p, {})] if isinstance(p, str) else p))
    BOXES.append((len(prs.slides._sldIdLst), x, y, w, h,
                  _est_height(runs, w, size, font, line, space), _flat[:58]))
    tb = sl.shapes.add_textbox(In(x), In(y), In(w), In(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    paras = [runs] if isinstance(runs, str) else runs
    for idx, para in enumerate(paras):
        p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
        p.alignment = align
        p.space_after = Pt(space)
        p.line_spacing = line
        for t, o in ([(para, {})] if isinstance(para, str) else para):
            r = p.add_run(); r.text = t
            f = r.font
            f.name = o.get("font", font)
            f.size = Pt(o.get("size", size))
            f.bold = o.get("bold", bold)
            f.italic = o.get("italic", italic)
            f.color.rgb = o.get("color", color)
    return tb


def label(sl, x, y, w, h, s, size=11.5, color=INK, bold=True, line=1.15):
    text(sl, x, y, w, h, s, size=size, color=color, bold=bold,
         align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, line=line)


def node(sl, x, y, w, h, title, sub=None, fill=PANEL, edge=RULE, ts=12, ss=9.5,
         tcolor=INK):
    box(sl, x, y, w, h, fill=fill, line=edge)
    if sub:
        label(sl, x, y + 0.02, w, h * 0.55, title, size=ts, color=tcolor)
        text(sl, x + 0.05, y + h * 0.55, w - 0.1, h * 0.42, sub, size=ss, color=MUTED,
             align=PP_ALIGN.CENTER, line=1.15)
    else:
        label(sl, x, y, w, h, title, size=ts, color=tcolor)


def arrow(sl, x1, y1, x2, y2, color=ACCENT, lw=1.5):
    cn = sl.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, In(x1), In(y1), In(x2), In(y2))
    cn.line.color.rgb = color
    cn.line.width = Pt(lw)
    cn.line.end_arrow_type = 2
    cn.shadow.inherit = False
    return cn


def chev(sl, x, y, h, color=ACCENT, size=15):
    text(sl, x, y, 0.22, h, "›", size=size, color=color,
         align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, bold=True)


def slide(kicker, title):
    """A standard light content slide with header, rule and footer."""
    sl = prs.slides.add_slide(BLANK)
    n = len(prs.slides._sldIdLst)
    box(sl, 0, 0, W, H, fill=WHITE)
    box(sl, 0, 0, 0.055, H, fill=ACCENT)
    text(sl, M, 0.40, 10, 0.25, kicker.upper(), size=10.5, color=ACCENT, bold=True)
    text(sl, M, 0.68, W - 2 * M, 0.5, title, size=27, color=INK, bold=True)
    box(sl, M, 1.32, W - 2 * M, 0.022, fill=RULE)
    text(sl, W - M - 0.8, H - 0.46, 0.8, 0.22, str(n), size=10, color=FAINT,
         align=PP_ALIGN.RIGHT)
    text(sl, M, H - 0.46, 8.5, 0.22,
         "ASTRAM Gridlock  ·  Aman Kumar · Viswajit Sarak Patil · Sahil Pal",
         size=9, color=FAINT)
    return sl


def picture(sl, name, x, y, w, h, border=True):
    path = CHARTS / name
    iw, ih = Image.open(path).size
    sc = min(w / iw, h / ih)
    dw, dh = iw * sc, ih * sc
    px, py = x + (w - dw) / 2, y + (h - dh) / 2
    if border:
        box(sl, px - 0.04, py - 0.04, dw + 0.08, dh + 0.08, fill=WHITE, line=RULE)
    sl.shapes.add_picture(str(path), In(px), In(py), In(dw), In(dh))


def table(sl, x, y, w, rows, col_w, row_h=0.34, head_h=0.36, size=12, highlight=None):
    highlight = highlight or {}
    nr, nc = len(rows), len(rows[0])
    shp = sl.shapes.add_table(nr, nc, In(x), In(y), In(w), In(head_h + (nr - 1) * row_h))
    tbl = shp.table
    tbl.first_row = False; tbl.horz_banding = False
    for i, cw in enumerate(col_w):
        tbl.columns[i].width = Emu(int(In(w) * cw / sum(col_w)))
    tbl.rows[0].height = In(head_h)
    for r in range(1, nr):
        tbl.rows[r].height = In(row_h)
    for r, row in enumerate(rows):
        for c, val in enumerate(row):
            cell = tbl.cell(r, c)
            cell.text = str(val)
            cell.margin_left = cell.margin_right = In(0.08)
            cell.margin_top = cell.margin_bottom = In(0.01)
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            cell.fill.solid()
            cell.fill.fore_color.rgb = INK if r == 0 else (PANEL if r % 2 else WHITE)
            p = cell.text_frame.paragraphs[0]
            p.alignment = PP_ALIGN.LEFT if c == 0 else PP_ALIGN.CENTER
            f = p.runs[0].font if p.runs else p.font
            f.name = FONT if c == 0 else MONO
            f.size = Pt(size)
            f.bold = (r == 0) or ((r, c) in highlight)
            f.color.rgb = WHITE if r == 0 else highlight.get((r, c), INK)
    return tbl


def bullets(sl, x, y, w, items, size=14, gap=0.55, lead_color=INK):
    for i, (lead, rest) in enumerate(items):
        yy = y + i * gap
        box(sl, x, yy + 0.08, 0.075, 0.075, fill=ACCENT)
        text(sl, x + 0.26, yy, w - 0.26, gap,
             [[(lead, {"bold": True, "color": lead_color}), (rest, {"color": MUTED})]],
             size=size, line=1.22)


def callout(sl, x, y, w, h, lead, body, fill=PANEL, edge=RULE, lc=INK, size=12,
            lw=1.0, pad=0.26):
    box(sl, x, y, w, h, fill=fill, line=edge, lw=lw)
    text(sl, x + pad, y + 0.15, w - 2 * pad, h - 0.3,
         [[(lead, {"bold": True, "color": lc}), (body, {"color": INK})]],
         size=size, line=1.26)


# ══════════════════════════ 1 · Title (light) ══════════════════════════
s = prs.slides.add_slide(BLANK)
box(s, 0, 0, W, H, fill=WHITE)
box(s, 0, 0, 0.16, H, fill=ACCENT)
box(s, 0.85, 0, 0.014, H, fill=RULE)

text(s, 1.35, 1.28, 11, 0.3, "B.TECH PROJECT  ·  FINAL EVALUATION REPORT  ·  AUGUST 2026",
     size=11.5, color=ACCENT, bold=True)
text(s, 1.35, 1.78, 10.6, 2.0,
     "Event-Driven Traffic Congestion\nSeverity Prediction and Resource\nRecommendation System",
     size=36, color=INK, bold=True, line=1.14)
box(s, 1.35, 4.05, 2.2, 0.03, fill=ACCENT)

text(s, 1.35, 4.4, 6, 0.26, "SUBMITTED BY", size=10, color=FAINT, bold=True)
for i, (n, r) in enumerate(TEAM):
    text(s, 1.35, 4.72 + i * 0.36, 6.0, 0.32,
         [[(n, {"bold": True, "color": INK, "size": 15.5}),
           ("   " + r, {"color": MUTED, "size": 13, "font": MONO})]], space=0)

text(s, 1.35, 5.94, 6, 0.26, "SUPERVISOR", size=10, color=FAINT, bold=True)
text(s, 1.35, 6.2, 6, 0.3, "Dr. Saswata Roy", size=15, color=INK, bold=True)

box(s, 8.35, 4.4, W - M - 8.35, 1.0, fill=PANEL, line=RULE)
text(s, 8.6, 4.56, 3.6, 0.7,
     [[("Department of Information Technology", {"color": INK, "size": 12, "bold": True})],
      [("ABV-IIITM Gwalior", {"color": MUTED, "size": 12})]], space=4)
text(s, 8.35, 5.62, 4.2, 0.9,
     [[("Stacked ensemble  ·  4 base learners", {"color": FAINT, "size": 10.5, "font": MONO})],
      [("8,173 Bengaluru traffic events", {"color": FAINT, "size": 10.5, "font": MONO})],
      [("Next.js · Go/Gin · FastAPI · Docker", {"color": FAINT, "size": 10.5, "font": MONO})]],
     space=3)

# ══════════════════════ 2 · Problem & motivation ══════════════════════
s = slide("Chapter 1–2  ·  Introduction & Motivation", "The Problem")
text(s, M, 1.60, 7.3, 1.15,
     [[("When a traffic event is first reported, the control room must decide how much to "
        "send — officers, barricades, diversions — ", {"color": INK}),
       ("before anyone has seen the site.", {"color": INK, "bold": True})]],
     size=16.5, line=1.3)
text(s, M, 2.86, 7.3, 0.3, "That decision is currently made on experience alone.",
     size=13, color=MUTED, italic=True)
bullets(s, M, 3.34, 7.3, [
    ("Severity is not recorded.  ", "The raw log has no severity column — the target must be constructed."),
    ("Existing work predicts flow, not events.  ", "Most traffic ML forecasts speed or volume, not incident severity."),
    ("Rare classes matter most.  ", "Critical events are 3.6% of the data and the costliest to miss."),
    ("Prediction alone is not actionable.  ", "A severity number does not tell an officer what to deploy."),
], size=14, gap=0.62)

box(s, 8.5, 1.62, W - M - 8.5, 4.05, fill=PANEL, line=RULE)
text(s, 8.85, 1.9, 3.4, 0.3, "THE DATASET", size=11, color=ACCENT, bold=True)
for i, (k, v) in enumerate([("8,173", "traffic events, Bengaluru"),
                            ("46 → 30", "raw columns → engineered features"),
                            ("4", "severity classes (Low → Critical)"),
                            ("91.7%", "of events are just Low or High")]):
    yy = 2.30 + i * 0.86
    text(s, 8.85, yy, 3.4, 0.42, k, size=23, color=INK, bold=True)
    text(s, 8.85, yy + 0.50, 3.4, 0.3, v, size=11, color=MUTED)

text(s, M, 5.95, W - 2 * M, 0.9,
     [[("Goal:  ", {"bold": True, "color": ACCENT}),
       ("predict how severe a traffic event will be at the moment it is reported, and "
        "convert that prediction into a concrete resource recommendation.", {"color": INK})]],
     size=16, line=1.3)

# ══════════════════ 3 · Objectives & deliverables ══════════════════
s = slide("Chapter 4  ·  Objectives & Deliverables", "What the Project Set Out to Do")
for i, (num, head, sub) in enumerate([
        ("01", "Construct a severity target", "where the raw data provides none, from priority and closure fields."),
        ("02", "Engineer 30 predictive features", "spatial, temporal and contextual — including K-Means location clustering."),
        ("03", "Train four heterogeneous classifiers", "LightGBM, XGBoost, an MLP and TabNet, each evaluated independently first."),
        ("04", "Combine via out-of-fold stacking", "with a LightGBM meta-learner — reported honestly, including where it fails."),
        ("05", "Evaluate with imbalance-aware metrics", "macro-F1 and per-class recall, not accuracy alone."),
        ("06", "Deploy as a working full-stack service", "so the model is exercised as an operator would, not from a notebook.")]):
    cx = M + (i % 3) * 4.09
    cy = 1.48 + (i // 3) * 1.76
    box(s, cx, cy, 3.85, 1.6, fill=WHITE, line=RULE)
    box(s, cx, cy, 3.85, 0.04, fill=ACCENT)
    text(s, cx + 0.24, cy + 0.24, 3.3, 0.26, num, size=12.5, color=ACCENT, bold=True, font=MONO)
    text(s, cx + 0.24, cy + 0.52, 3.4, 0.5, head, size=13.5, color=INK, bold=True, line=1.15)
    text(s, cx + 0.24, cy + 1.04, 3.4, 0.5, sub, size=10.5, color=MUTED, line=1.22)

text(s, M, 5.1, 6.0, 0.26, "KEY DELIVERABLES", size=10.5, color=ACCENT, bold=True)
bullets(s, M, 5.42, 12.0, [
    ("Reproducible preprocessing pipeline  ", "— imputation, encoding, K-Means clustering, all serialized."),
    ("Five trained models + comparative evaluation  ", "— four base learners, one stacked meta-learner."),
    ("Rule-based recommendation engine  ", "— severity to manpower, barricading and diversion plan."),
], size=12.5, gap=0.42)

# ═══════════════ 4 · Literature survey & positioning ═══════════════
s = slide("Chapter 3  ·  Literature Survey", "Related Work and Where This Thesis Sits")
for i, (t, body, refs, fill, edge, tc) in enumerate([
        ("ML for incident severity",
         "Gradient-boosted tree ensembles consistently perform best on structured, tabular "
         "crash- and incident-severity data.",
         "Iranitalab & Khattak · Zhu · Chen", GRNBG, GRNED, GOOD),
        ("Deep learning for congestion",
         "Research concentrates on recurring, sensor-driven congestion — leaving event-driven, "
         "non-recurring congestion under-explored.",
         "Yin · Hussain · Dong", BLUEBG, BLUEED, BLUE),
        ("Ensembles & imbalance",
         "Stacked generalization and imbalance-aware evaluation are each well established, "
         "but rarely applied together.",
         "Wolpert · Chawla (SMOTE) · Zhang", AMBBG, AMBED, ACCENT)]):
    cx = M + i * 4.09
    box(s, cx, 1.5, 3.85, 2.15, fill=fill, line=edge)
    text(s, cx + 0.24, 1.68, 3.4, 0.3, t, size=13.5, color=INK, bold=True)
    text(s, cx + 0.24, 2.04, 3.4, 1.0, body, size=11.5, color=INK, line=1.26)
    text(s, cx + 0.24, 3.24, 3.4, 0.28, refs, size=9.5, color=tc, font=MONO, bold=True)

box(s, M, 3.95, W - 2 * M, 1.55, fill=PANEL, line=RULE, lw=1.5)
text(s, M + 0.3, 4.15, W - 2 * M - 0.6, 0.3, "THIS THESIS SITS AT THE INTERSECTION",
     size=11, color=ACCENT, bold=True)
text(s, M + 0.3, 4.5, W - 2 * M - 0.6, 0.9,
     "It applies a stacked ensemble of tree-based and neural classifiers to event-driven "
     "severity prediction, evaluates it with explicit, front-loaded attention to class "
     "imbalance rather than accuracy alone, and — unlike most severity-prediction work "
     "surveyed — couples the prediction directly to a deterministic resource-recommendation "
     "engine that turns a severity label into an actionable deployment plan.",
     size=13, color=INK, line=1.3)

for i, (t, d) in enumerate([
        ("Gap 1", "Event-driven congestion is under-studied next to recurring congestion."),
        ("Gap 2", "Stacking and imbalance-aware evaluation are rarely combined."),
        ("Gap 3", "Predictions are rarely converted into operational recommendations.")]):
    cx = M + i * 4.09
    box(s, cx, 5.72, 3.85, 0.92, fill=REDBG, line=REDED)
    text(s, cx + 0.24, 5.87, 3.4, 0.26, t.upper(), size=10, color=BAD, bold=True)
    text(s, cx + 0.24, 6.12, 3.4, 0.5, d, size=11, color=INK, line=1.22)

# ═══════════════ 5 · Dataset & missing-value audit ═══════════════
s = slide("Chapter 5  ·  Dataset", "The Data and Its Missing-Value Audit")
text(s, M, 1.5, 6.4, 0.55,
     "An anonymised export of 8,173 Bengaluru traffic events with 46 raw attributes. "
     "A column-by-column missingness audit split them into four bands:",
     size=13, color=INK, line=1.3)

for i, (band, detail, act, fill, edge, tc) in enumerate([
        ("96–100% missing", "comment · map_file · meta_data · resolution fields",
         "Dropped outright — essentially no signal.", REDBG, REDED, BAD),
        ("40–70% missing", "junction 69.3% · closed_datetime 61.6% · zone 57.9% · veh_type 40.2%",
         "Kept, with an explicit \"unknown\" category or presence flag.", AMBBG, AMBED, ACCENT),
        ("0% missing", "coordinates · event cause · priority · closure flag",
         "Retained — these build the target and the core features.", GRNBG, GRNED, GOOD),
        ("Identifiers", "id · client_id · created_by_id and similar keys",
         "Dropped regardless — a database key carries no signal.", PANEL, RULE, MUTED)]):
    yy = 2.2 + i * 1.06
    box(s, M, yy, 6.4, 0.96, fill=fill, line=edge)
    text(s, M + 0.24, yy + 0.12, 2.2, 0.28, band, size=12, color=tc, bold=True)
    text(s, M + 0.24, yy + 0.4, 5.9, 0.26, detail, size=9.5, color=MUTED, font=MONO)
    text(s, M + 0.24, yy + 0.66, 5.9, 0.26, act, size=11, color=INK)

picture(s, "missing_values.png", 7.5, 1.5, W - M - 7.5, 4.5)
text(s, 7.5, 6.15, W - M - 7.5, 0.6,
     "Missing-value distribution across the 46 raw columns (n = 8,173). Dropping the "
     "mid-band outright would have discarded real information.",
     size=10.5, color=MUTED, line=1.25, align=PP_ALIGN.CENTER)

# ═══════════════ EDA · temporal and distribution patterns ═══════════════
s = slide("Chapter 5  ·  Exploratory Analysis", "What the Data Looks Like Before Modelling")
text(s, M, 1.44, W - 2 * M, 0.5,
     "Exploratory analysis drove the feature design — the temporal structure below is the "
     "direct reason the engineered feature set carries rush-hour and day-of-week flags.",
     size=12.5, color=INK, line=1.28)

text(s, M, 2.06, 6.0, 0.26, "TEMPORAL STRUCTURE", size=10.5, color=ACCENT, bold=True)
picture(s, "temporal_overview.png", M, 2.34, 11.9, 2.3)
text(s, M, 4.72, 11.9, 0.3,
     "Event volume by hour and by day of week across all 8,173 records.",
     size=10.5, color=MUTED, align=PP_ALIGN.CENTER)

text(s, M, 5.04, 6.0, 0.26, "FEATURE DISTRIBUTIONS", size=10.5, color=ACCENT, bold=True)
picture(s, "distributions.png", M, 5.32, 6.3, 1.5)

box(s, 7.35, 5.04, W - M - 7.35, 1.82, fill=PANEL, line=RULE)
text(s, 7.6, 5.2, 4.7, 0.28, "WHAT THIS MOTIVATED", size=10.5, color=ACCENT, bold=True)
for i, (k, v) in enumerate([
        ("Peak-hour flags", "7–10 and 17–21 became binary features."),
        ("Day-of-week + weekend", "weekday and weekend traffic differ."),
        ("Time-of-day bucket", "a coarse grouping beside the raw hour."),
        ("Duration retained", "event length ties strongly to severity.")]):
    yy = 5.54 + i * 0.32
    box(s, 7.62, yy + 0.06, 0.06, 0.06, fill=ACCENT)
    text(s, 7.82, yy, 4.45, 0.3,
         [[(k + "  ", {"bold": True, "color": INK}), (v, {"color": MUTED})]],
         size=10, line=1.2)

# ═════════════ 6 · Target construction & imbalance ═════════════
s = slide("Chapter 5  ·  Target Construction", "Building a Severity Label That Does Not Exist")
callout(s, M, 1.5, 6.5, 0.86,
        "No severity column exists in the raw log.  ",
        "The four-class target is built by crossing two fields the control room records "
        "independently for its own purposes.",
        fill=REDBG, edge=REDED, lc=BAD, size=12.5)

table(s, M, 2.56, 6.5,
      [["Priority", "Road closure", "Code", "Label"],
       ["Low", "No", "0", "Low"],
       ["Low", "Yes", "1", "Medium"],
       ["High", "No", "2", "High"],
       ["High", "Yes", "3", "Critical"]],
      col_w=[1.6, 1.7, 1.0, 1.6], row_h=0.34, head_h=0.36, size=12,
      highlight={(4, 3): BAD})

callout(s, M, 4.5, 6.5, 1.0,
        "Both source fields were then removed.  ",
        "If left in, a model would simply re-learn this deterministic mapping instead of "
        "inferring severity from spatial, temporal and contextual signals — and would be "
        "useless on a genuinely new, unassessed event.",
        fill=AMBBG, edge=AMBED, lc=ACCENT, size=12)

text(s, M, 5.68, 6.5, 0.26, "RESULTING CLASS DISTRIBUTION", size=10.5, color=ACCENT, bold=True)
table(s, M, 5.98, 6.5,
      [["Code", "Label", "Count", "Share"],
       ["0", "Low", "2,764", "33.8%"],
       ["1", "Medium", "379", "4.6%"],
       ["2", "High", "4,733", "57.9%"],
       ["3", "Critical", "297", "3.6%"]],
      col_w=[0.9, 1.8, 1.4, 1.4], row_h=0.24, head_h=0.26, size=10.5,
      highlight={(2, 3): BAD, (4, 3): BAD})

picture(s, "target_distribution.png", 7.5, 1.5, W - M - 7.5, 3.0)
callout(s, 7.5, 4.75, W - M - 7.5, 1.35,
        "The imbalance that shapes everything.  ",
        "Low and High together are 91.7% of all events. Medium and Critical make up under "
        "9% between them — fewer than 300 Critical events in 8,173.",
        fill=PANEL, edge=RULE, size=12)

# ═══════════ 7 · Feature engineering & K-Means ═══════════
s = slide("ML Concept  ·  Feature Engineering", "30 Features — and Why Coordinates Need Clustering")
for i, (g, f) in enumerate([
        ("SPATIAL", "latitude · longitude · corridor · police station · zone · junction · location cluster"),
        ("TEMPORAL", "hour · minute · day of week · month · weekend flag · rush-hour flags · time bucket"),
        ("CONTEXTUAL", "event type · event cause · vehicle type · duration · status · weather flag")]):
    yy = 1.5 + i * 1.02
    box(s, M, yy, 6.4, 0.9, fill=PANEL, line=RULE)
    text(s, M + 0.24, yy + 0.14, 5.9, 0.25, g, size=10.5, color=ACCENT, bold=True)
    text(s, M + 0.24, yy + 0.42, 5.9, 0.42, f, size=11.5, color=INK, line=1.25)

box(s, M, 4.66, 6.4, 2.3, fill=PURBG, line=PURED, lw=1.5)
text(s, M + 0.24, 4.86, 5.9, 0.28, "K-MEANS  ·  THE ONE UNSUPERVISED STEP",
     size=10.5, color=PURTX, bold=True)
text(s, M + 0.24, 5.18, 5.9, 0.95,
     "Supervised models learn from examples where the answer is known. K-Means is "
     "unsupervised — nobody tells it the answer, it just finds structure. It repeatedly "
     "assigns each event to the nearest cluster centre, then recomputes each centre as the "
     "mean of its points, until nothing moves.",
     size=11.5, color=INK, line=1.26)
text(s, M + 0.24, 6.22, 5.9, 0.6,
     [[("Why it matters:  ", {"bold": True, "color": PURTX}),
       ("raw lat/long are useless to a classifier — two events 100 m apart look like "
        "unrelated numbers. The cluster ID (0–19) becomes a feature instead.", {"color": INK})]],
     size=11.5, line=1.26)

picture(s, "geo_clusters.png", 7.5, 1.5, W - M - 7.5, 4.5)
text(s, 7.5, 6.15, W - M - 7.5, 0.5,
     "20 K-Means clusters over Bengaluru incident coordinates.",
     size=11, color=MUTED, align=PP_ALIGN.CENTER)

# ═══════════════ 8 · End-to-end ML pipeline ═══════════════
s = slide("Chapter 5  ·  Methodology", "End-to-End ML Pipeline")
for i, (t, sub) in enumerate([("Raw log", "8,173 × 46"), ("Cleaning", "impute / drop"),
                              ("30 features", "spatial · temporal"), ("K-Means", "K = 20"),
                              ("Encode + scale", "9 encoders"), ("80/20 split", "stratified")]):
    cx = M + i * 2.02
    node(s, cx, 1.55, 1.82, 0.78, t, sub,
         fill=PURBG if i == 3 else BLUEBG, edge=PURED if i == 3 else BLUEED, ts=12, ss=9.5)
    if i < 5:
        chev(s, cx + 1.84, 1.55, 0.78)

for i, (t, fill, edge) in enumerate([("LightGBM", GRNBG, GRNED), ("XGBoost", GRNBG, GRNED),
                                     ("MLP", AMBBG, AMBED), ("TabNet", AMBBG, AMBED)]):
    cx = M + 0.55 + i * 2.85
    node(s, cx, 2.72, 2.6, 0.55, t, fill=fill, edge=edge, ts=13)
    arrow(s, cx + 1.3, 3.27, cx + 1.3, 3.6, color=ACCENT, lw=1.2)

node(s, M, 3.62, W - 2 * M, 0.46,
     "16 meta-features  =  4 models × 4 class probabilities  ·  generated out-of-fold",
     fill=PANEL, edge=RULE, ts=13)
arrow(s, W / 2, 4.08, W / 2, 4.38, color=ACCENT, lw=1.5)
node(s, 4.2, 4.4, 4.9, 0.62, "Stacked meta-learner  ·  LightGBM",
     "learns how much to trust each base model", fill=GRNBG, edge=GRNED, ts=14, ss=10)
arrow(s, W / 2, 5.02, W / 2, 5.32, color=ACCENT, lw=1.5)
node(s, 4.2, 5.34, 4.9, 0.5, "Severity  0 Low · 1 Medium · 2 High · 3 Critical",
     fill=REDBG, edge=REDED, ts=12.5)

callout(s, M, 5.98, 6.1, 0.98,
        "Stage 1 — learned.  ",
        "Four base classifiers with different structural biases, combined by a "
        "meta-learner trained on their out-of-fold probabilities.",
        fill=GRNBG, edge=GRNED, lc=GOOD, size=11.5, pad=0.22)
callout(s, 7.05, 5.98, W - M - 7.05, 0.98,
        "Stage 2 — deterministic.  ",
        "A fixed rule table converts the predicted severity into a manpower, barricading "
        "and diversion plan. No ML involved.",
        fill=AMBBG, edge=AMBED, lc=ACCENT, size=11.5, pad=0.22)

# ═══════════════ 9 · Base learners ═══════════════
s = slide("ML Concept  ·  Base Learners", "Four Models, Two Very Different Learning Styles")
box(s, M, 1.45, 6.15, 2.55, fill=GRNBG, line=GRNED, lw=1.5)
text(s, M + 0.25, 1.62, 5.6, 0.28, "GRADIENT-BOOSTED TREES  ·  LightGBM, XGBoost",
     size=10.5, color=GOOD, bold=True)
text(s, M + 0.25, 1.93, 5.6, 0.42,
     "A decision tree is a flowchart of yes/no questions ending in a prediction. "
     "One tree is weak — so build hundreds in sequence:", size=11.5, color=INK, line=1.24)
for i, (t, sub) in enumerate([("Tree 1", "first guess"), ("Tree 2", "fixes T1 errors"),
                              ("Tree 3", "fixes T2 errors"), ("… ×1000", "")]):
    cx = M + 0.25 + i * 1.42
    node(s, cx, 2.5, 1.2, 0.6, t, sub or None, fill=WHITE, edge=GRNED, ts=11, ss=8.5)
    if i < 3:
        arrow(s, cx + 1.21, 2.8, cx + 1.4, 2.8, color=GOOD, lw=1.2)
text(s, M + 0.25, 3.22, 5.6, 0.65,
     "Each new tree specialises in the mistakes the previous ones made. Strongest family "
     "for mixed, table-shaped data — and the source of this project's best results.",
     size=11.5, color=INK, line=1.24)

box(s, 7.15, 1.45, W - M - 7.15, 2.55, fill=AMBBG, line=AMBED, lw=1.5)
text(s, 7.4, 1.62, 5.0, 0.28, "NEURAL APPROACHES  ·  MLP, TabNet",
     size=10.5, color=ACCENT, bold=True)
text(s, 7.4, 1.93, 5.0, 0.42,
     "Layers of artificial neurons pass weighted signals forward; weights are adjusted "
     "over many passes to reduce error.", size=11.5, color=INK, line=1.24)
for i, (n, cnt) in enumerate([("256", 4), ("128", 3), ("64", 3), ("32", 2)]):
    cx = 7.55 + i * 1.2
    for j in range(cnt):
        box(s, cx + 0.28, 2.52 + j * 0.16, 0.12, 0.12, fill=WHITE, line=AMBED,
            shape=MSO_SHAPE.OVAL)
    text(s, cx, 3.14, 0.7, 0.22, n, size=9.5, color=MUTED, align=PP_ALIGN.CENTER, font=MONO)
    if i < 3:
        arrow(s, cx + 0.72, 2.75, cx + 0.95, 2.75, color=ACCENT, lw=1.0)
text(s, 7.4, 3.42, 5.0, 0.45,
     "TabNet adds attention — it learns which features to focus on at each decision step "
     "rather than weighing everything at once.", size=11.5, color=INK, line=1.24)

for i, (t, d) in enumerate([
        ("Early stopping", "Training halts once the held-out score stops improving — prevents overfitting, where a model memorises quirks that don't generalise."),
        ("Class weighting", "Errors on rare classes cost more. Applied to LightGBM and XGBoost only — and that single choice decides the results on slide 12."),
        ("Stratified split", "6,538 train / 1,635 test, class proportions preserved. With only 297 Critical events, a careless split would make results noise.")]):
    cx = M + i * 4.09
    box(s, cx, 4.2, 3.85, 1.55, fill=PANEL, line=RULE)
    box(s, cx, 4.2, 3.85, 0.04, fill=ACCENT)
    text(s, cx + 0.24, 4.42, 3.4, 0.28, t, size=13, color=INK, bold=True)
    text(s, cx + 0.24, 4.75, 3.4, 0.9, d, size=10.5, color=MUTED, line=1.25)

callout(s, M, 5.95, W - 2 * M, 0.72, "Why four models?  ",
        "The data mixes continuous numbers, categories and time flags. Models with different "
        "structural biases make different mistakes — which is precisely what makes combining "
        "them worthwhile.", fill=BLUEBG, edge=BLUEED, lc=BLUE, size=12.5)

# ═══════════════ 10 · Stacked generalization ═══════════════
s = slide("ML Concept  ·  Stacked Generalization", "Training the Meta-Learner Without Leakage")
callout(s, M, 1.42, W - 2 * M, 0.78, "The problem:  ",
        "a model that has already seen an event predicts it far too confidently. Training the "
        "meta-learner on those inflated probabilities teaches it to trust an accuracy that will "
        "not exist on real new events — this is data leakage.",
        fill=REDBG, edge=REDED, lc=BAD, size=12.5)

text(s, M, 2.38, 3.0, 0.25, "5-FOLD CROSS-VALIDATION", size=10.5, color=ACCENT, bold=True)
cw, ch, gp = 1.16, 0.42, 0.07
for r in range(5):
    yy = 2.72 + r * (ch + gp)
    text(s, M, yy, 0.62, ch, f"Fold {r+1}", size=10.5, color=MUTED,
         align=PP_ALIGN.RIGHT, anchor=MSO_ANCHOR.MIDDLE)
    for c in range(5):
        cx = M + 0.75 + c * (cw + gp)
        held = (c == r)
        node(s, cx, yy, cw, ch, "predict" if held else "train",
             fill=AMBBG if held else BLUEBG, edge=AMBED if held else BLUEED,
             ts=10, tcolor=ACCENT if held else BLUE)
text(s, M + 0.75, 5.36, 6.2, 0.5,
     "In each fold, fresh copies of all four base models train on the blue slices and "
     "predict the orange one.", size=11, color=MUTED, line=1.24)

arrow(s, 7.35, 3.9, 7.95, 3.9, color=ACCENT, lw=1.8)
node(s, 8.05, 2.72, 4.55, 1.15, "Out-of-fold probability matrix",
     "6,538 rows × 16 columns — every row predicted\nby a model that never trained on it",
     fill=GRNBG, edge=GRNED, ts=13, ss=10)
arrow(s, 10.32, 3.87, 10.32, 4.2, color=ACCENT, lw=1.5)
node(s, 8.05, 4.22, 4.55, 0.72, "Meta-learner  ·  LightGBM",
     "trained on the 16 columns → final severity", fill=GRNBG, edge=GRNED, ts=13, ss=10)

callout(s, M, 6.0, W - 2 * M, 0.95, "Honest result:  ",
        "stacking did NOT beat the base models here — the ensemble posts the lowest accuracy "
        "of all five (0.8948). The in-fold model copies were lighter than the final tuned models, "
        "and with under 100 Critical examples per fold the meta-learner had too little signal to "
        "weight the rare classes well. It still reached the second-best Critical recall.",
        fill=AMBBG, edge=AMBED, lc=ACCENT, size=12)

# ═══════════════ 11 · Evaluation metrics ═══════════════
s = slide("ML Concept  ·  Evaluation", "Precision, Recall, and Why Accuracy Lies")
text(s, M, 1.42, 6.4, 0.28, "CONFUSION MATRIX  ·  MLP ON THE CRITICAL CLASS",
     size=10.5, color=ACCENT, bold=True)
text(s, M + 1.55, 1.78, 4.4, 0.24, "PREDICTED", size=10, color=MUTED,
     align=PP_ALIGN.CENTER, bold=True)
text(s, M + 1.55, 2.04, 2.2, 0.24, "Critical", size=10.5, color=INK,
     align=PP_ALIGN.CENTER, bold=True)
text(s, M + 3.75, 2.04, 2.2, 0.24, "Not Critical", size=10.5, color=INK,
     align=PP_ALIGN.CENTER, bold=True)
text(s, M, 2.55, 1.45, 0.5, "ACTUAL\nCritical (59)", size=10.5, color=INK,
     align=PP_ALIGN.RIGHT, bold=True, line=1.2)
text(s, M, 3.45, 1.45, 0.5, "Not Critical\n(1,576)", size=10.5, color=INK,
     align=PP_ALIGN.RIGHT, bold=True, line=1.2)
for r, c, n, lab, fill, edge, col in [
        (0, 0, "2", "true positives", GRNBG, GRNED, GOOD),
        (0, 1, "57", "false negatives — missed", REDBG, REDED, BAD),
        (1, 0, "0", "false positives", PANEL, RULE, MUTED),
        (1, 1, "1,576", "true negatives", PANEL, RULE, MUTED)]:
    cx, cy = M + 1.55 + c * 2.22, 2.36 + r * 0.9
    box(s, cx, cy, 2.16, 0.84, fill=fill, line=edge)
    text(s, cx, cy + 0.1, 2.16, 0.36, n, size=19, color=col, bold=True, align=PP_ALIGN.CENTER)
    text(s, cx, cy + 0.5, 2.16, 0.28, lab, size=9.5, color=MUTED, align=PP_ALIGN.CENTER)

for i, (t, formula, val, desc, fill, edge, col) in enumerate([
        ("Precision", "TP / (TP + FP)  =  2 / 2", "1.00",
         "Of everything it CALLED Critical, how much really was? Perfect — and meaningless "
         "alone: it stays perfect precisely because the model almost never risks the call.",
         PURBG, PURED, PURTX),
        ("Recall", "TP / (TP + FN)  =  2 / 59", "0.03",
         "Of everything that TRULY WAS Critical, how much did it catch? 3%. It lets 57 of 59 "
         "critical events through, labelled less urgent.", AMBBG, AMBED, ACCENT)]):
    cx = M + i * 3.28
    box(s, cx, 4.2, 3.1, 1.84, fill=fill, line=edge)
    text(s, cx + 0.2, 4.34, 2.7, 0.26, t.upper(), size=10.5, color=col, bold=True)
    text(s, cx + 0.2, 4.60, 2.7, 0.24, formula, size=10, color=MUTED, font=MONO)
    text(s, cx + 0.2, 4.84, 2.7, 0.3, val, size=15, color=INK, bold=True, font=MONO)
    text(s, cx + 0.2, 5.20, 2.7, 0.8, desc, size=9.5, color=INK, line=1.2)

box(s, 7.5, 1.42, W - M - 7.5, 2.35, fill=PANEL, line=RULE)
text(s, 7.75, 1.6, 4.6, 0.28, "MACRO-F1  ·  THE METRIC THIS THESIS LEADS WITH",
     size=10.5, color=ACCENT, bold=True)
text(s, 7.75, 1.94, 4.6, 1.7,
     [[("F1", {"bold": True, "color": INK}),
       (" combines precision and recall into one number (their harmonic mean — it stays low "
        "unless both are decent).", {"color": INK})],
      [("Macro-F1", {"bold": True, "color": INK}),
       (" averages F1 across all four classes, each counting equally. A rare class weighs as "
        "much as a common one, so a model that ignores Critical gets punished — which plain "
        "accuracy never does.", {"color": INK})]], size=11.5, line=1.26, space=6)

box(s, 7.5, 3.9, W - M - 7.5, 2.06, fill=REDBG, line=REDED, lw=1.5)
text(s, 7.75, 4.1, 4.6, 0.28, "WHY ACCURACY LIES HERE", size=10.5, color=BAD, bold=True)
text(s, 7.75, 4.42, 4.6, 0.36, "92.4% accurate  ·  3% Critical recall",
     size=13.5, color=INK, bold=True, font=MONO)
text(s, 7.75, 4.86, 4.6, 1.0,
     "Because 91.7% of events are Low or High, a model can lean on those two classes, clear "
     "92% accuracy, and still be blind to the one class the system exists to catch. That "
     "single number pair is this thesis's core argument.", size=11, color=INK, line=1.26)

callout(s, M, 6.14, W - 2 * M, 0.62, "Therefore:  ",
        "every model in this project is reported on macro-F1 and per-class recall, not "
        "accuracy alone.", fill=BLUEBG, edge=BLUEED, lc=BLUE, size=12.5)

# ═══════════════ 12 · Results ═══════════════
s = slide("Chapter 7  ·  Results", "Model Comparison — n = 1,635 Held-Out Events")
text(s, M, 1.42, 6.3, 0.26, "OVERALL PERFORMANCE", size=10.5, color=ACCENT, bold=True)
table(s, M, 1.72, 6.3,
      [["Model", "Accuracy", "Macro-F1", "Weighted-F1"],
       ["LightGBM", "0.9223", "0.6949", "0.9148"],
       ["XGBoost", "0.9168", "0.6906", "0.9114"],
       ["MLP-NN", "0.9242", "0.5843", "0.8992"],
       ["TabNet", "0.9254", "0.6027", "0.9020"],
       ["Stacked Ensemble", "0.8948", "0.6639", "0.8968"]],
      col_w=[2.4, 1.3, 1.3, 1.4], row_h=0.33, head_h=0.34, size=12,
      highlight={(1, 2): GOOD, (4, 1): ACCENT})

text(s, M, 3.92, 6.3, 0.26, "CRITICAL CLASS  ·  SUPPORT = 59", size=10.5, color=ACCENT, bold=True)
table(s, M, 4.2, 6.3,
      [["Model", "Precision", "Recall", "F1"],
       ["LightGBM", "0.54", "0.32", "0.40"],
       ["XGBoost", "0.46", "0.36", "0.40"],
       ["MLP-NN", "1.00", "0.03", "0.07"],
       ["TabNet", "0.75", "0.10", "0.18"],
       ["Stacked Ensemble", "0.28", "0.34", "0.31"]],
      col_w=[2.4, 1.3, 1.3, 1.4], row_h=0.33, head_h=0.34, size=12,
      highlight={(3, 1): GOOD, (3, 2): BAD, (1, 3): GOOD, (2, 3): GOOD})

picture(s, "model_comparison.png", 7.35, 1.6, W - M - 7.35, 2.4)
callout(s, 7.35, 4.15, W - M - 7.35, 1.15, "The reversal.  ",
        "TabNet has the highest accuracy (0.9254). LightGBM has the best macro-F1 (0.6949). "
        "Ranking by accuracy picks the wrong model for deployment.",
        fill=REDBG, edge=REDED, lc=BAD, size=12, lw=1.5)
callout(s, 7.35, 5.42, W - M - 7.35, 1.15, "What fixed it.  ",
        "LightGBM and XGBoost are the only models trained with class-balanced weighting — "
        "and they are exactly the two with usable Critical recall (0.32, 0.36).",
        fill=GRNBG, edge=GRNED, lc=GOOD, size=12, lw=1.5)

box(s, M, 6.3, 6.3, 0.62, fill=PANEL, line=RULE)
text(s, M + 0.22, 6.42, 5.9, 0.44,
     "All five models handle the majority classes comfortably — Low F1 0.93–0.94, "
     "High F1 0.95–0.97.", size=11, color=MUTED, line=1.26)

# ═══════════════ Feature importance ═══════════════
s = slide("Chapter 7  ·  Feature Importance", "What the Strongest Model Actually Relies On")
picture(s, "lgbm_feature_importance.png", M, 1.44, 5.6, 5.0)
text(s, M, 6.54, 5.6, 0.3, "LightGBM split-based importance; red bars mark the top quartile.",
     size=10.5, color=MUTED, align=PP_ALIGN.CENTER)

text(s, 6.55, 1.44, 6.0, 0.26, "WHAT RANKS HIGHEST", size=10.5, color=ACCENT, bold=True)
for i, (k, v, fill, edge, tc) in enumerate([
        ("Raw coordinates dominate", "longitude and latitude are the two most-used split "
         "features — fine-grained geography carries the most signal.", PURBG, PURED, PURTX),
        ("Fine-grained time next", "day_of_year, day and hour rank immediately below — the "
         "model prefers continuous time over the engineered rush-hour flags.",
         BLUEBG, BLUEED, BLUE),
        ("Then jurisdiction & cause", "pin_code, police_station, day_of_week and event_cause "
         "form the following band.", GRNBG, GRNED, GOOD)]):
    yy = 1.76 + i * 1.06
    box(s, 6.55, yy, W - M - 6.55, 0.94, fill=fill, line=edge)
    text(s, 6.79, yy + 0.13, 5.4, 0.28, k, size=12.5, color=tc, bold=True)
    text(s, 6.79, yy + 0.42, 5.4, 0.44, v, size=11, color=INK, line=1.22)

callout(s, 6.55, 5.02, W - M - 6.55, 1.0, "The reading:  ",
        "severity is driven mainly by WHERE an event happens and WHEN — with event cause "
        "as the strongest non-geographic signal.",
        fill=PANEL, edge=RULE, size=12)

callout(s, 6.55, 6.14, W - M - 6.55, 0.7, "Caveat:  ",
        "split-count favours high-cardinality features — which is why the binary flags "
        "sit at the bottom. It counts how OFTEN a feature is split on, not its effect.",
        fill=AMBBG, edge=AMBED, lc=ACCENT, size=10.5)

# ═══════════════ 13 · Recommendation engine ═══════════════
s = slide("Chapter 5  ·  Recommendation Engine", "From Severity to an Actionable Deployment")
callout(s, M, 1.42, W - 2 * M, 0.7,
        "The learned models answer \"how severe does this look\".  ",
        "The rule engine answers \"what do we do about it\" — kept deterministic and "
        "separate so it stays auditable and tunable without retraining.",
        fill=PANEL, edge=RULE, size=12.5)

text(s, M, 2.32, 8, 0.26, "BASE SEVERITY-TO-ACTION MAPPING", size=10.5, color=ACCENT, bold=True)
table(s, M, 2.62, 11.9,
      [["Severity", "Officers", "Delay", "Barricading", "Diversion"],
       ["Low", "2 – 4", "15 min", "Cones / indicators only", "No diversion needed"],
       ["Medium", "4 – 8", "30 min", "Partial barricade (1 lane) + 1 marshal", "Advisory alternate route"],
       ["High", "8 – 14", "60 min", "Full barricade, both sides, 2 marshal points", "Mandatory route + digital signage"],
       ["Critical", "15 – 25", "90 min", "Full corridor lockdown + marshal chain", "Police-escorted + public advisory"]],
      col_w=[1.3, 1.1, 0.9, 4.0, 3.4], row_h=0.4, head_h=0.36, size=11,
      highlight={(4, 1): BAD})

text(s, M, 4.86, 6, 0.26, "CONTEXTUAL MULTIPLIERS", size=10.5, color=ACCENT, bold=True)
for i, (k, v) in enumerate([("×1.4", "on a designated high-density corridor"),
                            ("×1.25", "in a peak window — 7–10 or 17–21 hours")]):
    yy = 5.16 + i * 0.62
    box(s, M, yy, 5.6, 0.54, fill=AMBBG, line=AMBED)
    text(s, M + 0.2, yy + 0.13, 0.9, 0.3, k, size=14, color=ACCENT, bold=True, font=MONO)
    text(s, M + 1.15, yy + 0.16, 4.3, 0.3, v, size=11.5, color=INK)

text(s, 6.65, 4.86, 6, 0.26, "CAUSE-SPECIFIC ACTIONS", size=10.5, color=ACCENT, bold=True)
for i, (k, v) in enumerate([
        ("public_event ≥ High", "crowd-control perimeter + coordinate with organiser"),
        ("accident ≥ High", "keep ambulance lane open + trauma centre on standby"),
        ("pre-announced event", "pre-deploy minimum officers 2 hours before start")]):
    yy = 5.16 + i * 0.54
    text(s, 6.65, yy, 2.5, 0.28, k, size=10, color=BLUE, bold=True, font=MONO)
    text(s, 9.25, yy, 3.4, 0.28, v, size=10.5, color=INK)

callout(s, M, 6.5, W - 2 * M, 0.5, "Note:  ",
        "this stage involves no machine learning at all — the ML predicts how severe, a "
        "hand-written rule decides what to do about it.",
        fill=BLUEBG, edge=BLUEED, lc=BLUE, size=11.5)

# ═══════════════ Worked example ═══════════════
s = slide("Walkthrough", "One Event, End to End")
text(s, M, 1.42, W - 2 * M, 0.3,
     [[("An illustrative walkthrough of a single request through the whole system. "
        "The rule-engine figures are exact; the class probabilities are example values.",
        {"color": MUTED})]], size=11, line=1.24)

# step 1 — input
box(s, M, 1.82, 2.75, 2.5, fill=BLUEBG, line=BLUEED, lw=1.5)
text(s, M + 0.2, 1.96, 2.4, 0.26, "1 · EVENT REPORTED", size=10, color=BLUE, bold=True)
for i, (k, v) in enumerate([("cause", "accident"), ("time", "18:30 Tue"),
                            ("corridor", "Outer Ring Rd"), ("lat/long", "12.93, 77.61"),
                            ("veh_type", "heavy"), ("duration", "90 min")]):
    yy = 2.28 + i * 0.32
    text(s, M + 0.2, yy, 1.1, 0.26, k, size=9.5, color=MUTED, font=MONO)
    text(s, M + 1.25, yy, 1.4, 0.26, v, size=9.5, color=INK, font=MONO, bold=True)
arrow(s, M + 2.78, 3.05, M + 3.12, 3.05, color=ACCENT, lw=2.0)

# step 2 — features
box(s, 3.86, 1.82, 2.75, 2.5, fill=PURBG, line=PURED, lw=1.5)
text(s, 4.06, 1.96, 2.4, 0.26, "2 · FEATURE VECTOR", size=10, color=PURTX, bold=True)
text(s, 4.06, 2.28, 2.4, 1.5,
     "Same encoders, scaler and K-Means as training:\n\n"
     "· cause → encoded id\n"
     "· 18:30 → evening peak = 1\n"
     "· lat/long → cluster 7\n"
     "· 30 features assembled",
     size=10, color=INK, line=1.3)
arrow(s, 6.64, 3.05, 6.98, 3.05, color=ACCENT, lw=2.0)

# step 3 — models
box(s, 7.72, 1.82, 2.75, 2.5, fill=GRNBG, line=GRNED, lw=1.5)
text(s, 7.92, 1.96, 2.4, 0.26, "3 · BASE MODELS", size=10, color=GOOD, bold=True)
for i, (m, p) in enumerate([("LightGBM", "0.71"), ("XGBoost", "0.68"),
                            ("MLP", "0.62"), ("TabNet", "0.65")]):
    yy = 2.3 + i * 0.3
    text(s, 7.92, yy, 1.3, 0.26, m, size=9.5, color=INK, font=MONO)
    text(s, 9.3, yy, 0.9, 0.26, p, size=9.5, color=GOOD, font=MONO, bold=True)
text(s, 7.92, 3.56, 2.4, 0.6, "P(High) from each →\n16 probabilities stacked",
     size=9.5, color=MUTED, line=1.25)
arrow(s, 10.5, 3.05, 10.84, 3.05, color=ACCENT, lw=2.0)

# step 4 — verdict
box(s, 11.58, 1.82, W - M - 11.58, 2.5, fill=REDBG, line=REDED, lw=1.5)
text(s, 11.72, 1.96, 1.6, 0.26, "4 · VERDICT", size=10, color=BAD, bold=True)
text(s, 11.72, 2.4, 1.6, 0.4, "HIGH", size=19, color=BAD, bold=True)
text(s, 11.72, 2.86, 1.6, 0.5, "severity 2\nconf. 0.71", size=10, color=INK,
     font=MONO, line=1.3)
text(s, 11.72, 3.5, 1.6, 0.5, "cluster 7\npeak hour", size=9.5, color=MUTED,
     font=MONO, line=1.3)

arrow(s, 12.42, 4.36, 12.42, 4.66, color=ACCENT, lw=2.0)

# step 5 — rule engine arithmetic
box(s, M, 4.7, W - 2 * M, 1.78, fill=AMBBG, line=AMBED, lw=1.5)
text(s, M + 0.28, 4.86, 6.0, 0.28, "5 · RULE ENGINE  ·  DETERMINISTIC, NO ML",
     size=10.5, color=ACCENT, bold=True)
text(s, M + 0.28, 5.2, 5.6, 0.9,
     [[("Base for High severity:  ", {"bold": True, "color": INK}),
       ("8–14 officers", {"font": MONO, "color": INK})],
      [("× 1.4  major corridor      × 1.25  peak window (17–21)", {"font": MONO, "color": MUTED})],
      [("→  14–25 officers", {"bold": True, "color": ACCENT, "size": 14, "font": MONO})]],
     size=11.5, space=4, line=1.25)
for i, (k, v) in enumerate([
        ("Delay estimate", "60 minutes"),
        ("Barricading", "Full barricade, both sides, 2 marshal points"),
        ("Diversion", "Mandatory alternate route + digital signage"),
        ("Cause rule (accident ≥ High)", "Keep ambulance lane open · trauma centre on standby")]):
    yy = 5.22 + i * 0.32
    text(s, 6.9, yy, 2.4, 0.3, k, size=10, color=MUTED)
    text(s, 9.35, yy, 3.3, 0.3, v, size=10, color=INK, bold=True)

callout(s, M, 6.54, W - 2 * M, 0.46, "End to end:  ",
        "a raw event description becomes a severity class, a confidence, and a concrete "
        "deployment plan — in a single API call.",
        fill=PANEL, edge=RULE, size=11.5)

# ═══════════════ 14 · Backend architecture ═══════════════
s = slide("Chapters 5–6  ·  System Architecture", "Backend Structure & Request Flow")
for i, (t, sub, port, fill, edge) in enumerate([
        ("Browser", "Next.js 16 · React\nTypeScript · Tailwind", ":3000", BLUEBG, BLUEED),
        ("API layer", "Go 1.26 · Gin\nrouting · CORS · validation", ":8080", GRNBG, GRNED),
        ("Inference sidecar", "Python · FastAPI\nmodel bundle in memory", ":8001", AMBBG, AMBED)]):
    cx = M + i * 4.32
    box(s, cx, 1.44, 3.85, 1.15, fill=fill, line=edge, lw=1.5)
    text(s, cx + 0.22, 1.6, 2.6, 0.3, t, size=14, color=INK, bold=True)
    text(s, cx + 0.22, 1.94, 3.4, 0.55, sub, size=10.5, color=MUTED, line=1.22)
    text(s, cx + 2.95, 1.6, 0.7, 0.3, port, size=11, color=INK, bold=True, font=MONO,
         align=PP_ALIGN.RIGHT)
    if i < 2:
        arrow(s, cx + 3.87, 2.0, cx + 4.28, 2.0, color=ACCENT, lw=2.0)

text(s, M, 2.78, 6.4, 0.26, "REQUEST LIFECYCLE  ·  POST /api/predict",
     size=10.5, color=ACCENT, bold=True)
for i, (n, t, sub) in enumerate([
        ("1", "Browser POSTs event attributes", "lat/long · cause · time"),
        ("2", "Gin handler validates & binds JSON", "handlers/predict.go"),
        ("3", "Go forwards to sidecar /infer", "5 s timeout"),
        ("4", "Sidecar rebuilds the feature vector", "encoders · scaler · K-Means"),
        ("5", "Base models → meta-learner", "16 stacked probabilities"),
        ("6", "Rule engine attaches resources", "manpower · barricading"),
        ("7", "JSON returns up the chain", "severity · confidence")]):
    yy = 3.1 + i * 0.53
    box(s, M, yy, 0.34, 0.34, fill=INK)
    text(s, M, yy, 0.34, 0.34, n, size=10.5, color=WHITE, bold=True,
         align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, font=MONO)
    text(s, M + 0.48, yy + 0.01, 3.25, 0.3, t, size=11.5, color=INK, bold=True)
    text(s, M + 3.95, yy + 0.03, 2.5, 0.3, sub, size=9, color=MUTED, font=MONO)

box(s, 7.35, 2.78, W - M - 7.35, 1.72, fill=PANEL, line=RULE)
text(s, 7.6, 2.94, 4.7, 0.26, "API SURFACE", size=10.5, color=ACCENT, bold=True)
for i, (m, ep, d) in enumerate([("POST", "/api/predict", "severity + recommendation"),
                                ("GET", "/api/meta", "corridors, stations, zones"),
                                ("GET", "/api/locate", "nearest station + cluster"),
                                ("GET", "/api/health", "sidecar reachability")]):
    yy = 3.26 + i * 0.29
    text(s, 7.6, yy, 0.6, 0.24, m, size=9.5, color=GOOD if m == "POST" else BLUE,
         bold=True, font=MONO)
    text(s, 8.2, yy, 1.75, 0.24, ep, size=9.5, color=INK, font=MONO, bold=True)
    text(s, 9.95, yy, 2.4, 0.24, d, size=9.5, color=MUTED)

box(s, 7.35, 4.62, W - M - 7.35, 1.32, fill=BLUEBG, line=BLUEED)
text(s, 7.6, 4.78, 4.7, 0.26, "WHY A SEPARATE PYTHON SIDECAR?", size=10.5, color=BLUE, bold=True)
text(s, 7.6, 5.08, 4.7, 0.8,
     "The trained models are Python objects (LightGBM, XGBoost, scikit-learn). Go cannot "
     "load them, but handles HTTP, concurrency and validation better. Splitting the tiers "
     "keeps each in the language it is strongest in.", size=10.5, color=INK, line=1.24)

callout(s, 7.35, 6.06, W - M - 7.35, 0.9, "Deployment.  ",
        "Both services are containerised and orchestrated with Docker Compose; the model "
        "bundle is loaded once at sidecar startup and held in memory.",
        fill=AMBBG, edge=AMBED, lc=ACCENT, size=10.5, pad=0.25)

# ═══════════════ 15 · Conclusions ═══════════════
s = slide("Chapter 7  ·  Conclusion & Future Scope", "Conclusions")
bullets(s, M, 1.55, 7.2, [
    ("A four-class severity target was constructed  ",
     "from priority and closure fields, with both removed from the features to keep the task honest."),
    ("LightGBM is the best model on macro-F1 (0.6949)  ",
     "despite TabNet posting the highest raw accuracy — the central metric-choice result."),
    ("Stacking did not improve on the base models  ",
     "posting the lowest accuracy (0.8948), reported honestly rather than omitted."),
    ("Class weighting is what recovered rare-class recall  ",
     "the only two models with usable Critical recall are the two that used it."),
    ("The pipeline runs as a deployed service  ",
     "Next.js → Go/Gin → FastAPI sidecar, containerised, not left inside a notebook."),
], size=13, gap=0.72)

box(s, 8.35, 1.55, W - M - 8.35, 3.7, fill=PANEL, line=RULE)
text(s, 8.6, 1.75, 3.6, 0.28, "LIMITATIONS", size=10.5, color=BAD, bold=True)
text(s, 8.6, 2.06, 3.6, 1.3,
     "Single city, single time period. Severity is a proxy built from operational fields, "
     "not a ground-truth measurement. Critical recall of 0.36 remains too low for "
     "unsupervised deployment.", size=11, color=INK, line=1.28)
text(s, 8.6, 3.5, 3.6, 0.28, "FUTURE SCOPE", size=10.5, color=GOOD, bold=True)
text(s, 8.6, 3.81, 3.6, 1.3,
     "SMOTE / focal loss for the rare classes · decision-threshold tuning for recall · "
     "live traffic and weather feeds · multi-city validation.",
     size=11, color=INK, line=1.28)

box(s, M, 5.5, W - 2 * M, 0.92, fill=AMBBG, line=AMBED, lw=1.5)
text(s, M + 0.32, 5.68, W - 2 * M - 0.64, 0.6,
     [[("Central contribution:  ", {"bold": True, "color": ACCENT}),
       ("on imbalanced, safety-relevant traffic data, accuracy actively misleads — a "
        "92.4%-accurate model can be 97% blind to the class it exists to catch.",
        {"color": INK})]], size=14, line=1.3)

# ═══════════════ 16 · Thank you (light) ═══════════════
s = prs.slides.add_slide(BLANK)
box(s, 0, 0, W, H, fill=WHITE)
box(s, 0, 0, 0.16, H, fill=ACCENT)
box(s, 0.85, 0, 0.014, H, fill=RULE)

text(s, 1.35, 2.35, 10, 0.9, "Thank You", size=52, color=INK, bold=True)
box(s, 1.35, 3.62, 2.2, 0.03, fill=ACCENT)
text(s, 1.35, 3.94, 8, 0.4, "Questions and discussion", size=18, color=MUTED)

text(s, 1.35, 4.9, 6, 0.26, "PRESENTED BY", size=10, color=FAINT, bold=True)
for i, (n, r) in enumerate(TEAM):
    text(s, 1.35, 5.2 + i * 0.32, 6.0, 0.3,
         [[(n, {"bold": True, "color": INK, "size": 13}),
           ("   " + r, {"color": MUTED, "size": 11, "font": MONO})]], space=0)

box(s, 8.35, 4.9, W - M - 8.35, 1.35, fill=PANEL, line=RULE)
text(s, 8.6, 5.08, 3.6, 1.0,
     [[("Event-Driven Traffic Congestion Severity Prediction", {"color": INK, "size": 11, "bold": True})],
      [("Under the supervision of Dr. Saswata Roy", {"color": MUTED, "size": 10.5})],
      [("Department of IT · ABV-IIITM Gwalior", {"color": MUTED, "size": 10.5})]], space=4)

path = OUT / "ASTRAM_Gridlock_BTP_Presentation.pptx"
prs.save(path)
print(f"saved: {path}")
print(f"slides: {len(prs.slides._sldIdLst)}")

hits = []
for a in BOXES:
    asn, ax, ay, aw, ah, aest, aprev = a
    abot = ay + aest
    for b in BOXES:
        if b is a or b[0] != asn:
            continue
        bx, by, bw = b[1], b[2], b[3]
        if by <= ay + 0.02:                       # only things genuinely below
            continue
        if ax + aw <= bx + 0.02 or bx + bw <= ax + 0.02:   # need x-overlap
            continue
        if abot > by + 0.02:
            hits.append((asn, ay, abot, by, aprev, b[6]))
            break
print(f"\ncollisions: {len(hits)}")
for sn, ay, abot, by, aprev, bprev in sorted(hits):
    print(f"  s{sn:>2}  y={ay:5.2f} ends {abot:5.2f} > next {by:5.2f}  "
          f"(-{abot-by:4.2f})  {aprev[:44]!r} ONTO {bprev[:30]!r}")
