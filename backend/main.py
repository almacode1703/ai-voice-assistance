from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Dict
import os
import re as _re
import json
import datetime
import urllib.request
from dotenv import load_dotenv
from openai import OpenAI
from auth import router as auth_router

# PDF
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# --------------------------------------------------
# Kumbh Sans font setup (download once, cache locally)
# --------------------------------------------------
_FONT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts")
_FONT_REG  = "Helvetica"       # fallback
_FONT_BOLD = "Helvetica-Bold"  # fallback

def _setup_fonts() -> None:
    global _FONT_REG, _FONT_BOLD
    os.makedirs(_FONT_DIR, exist_ok=True)
    r_path = os.path.join(_FONT_DIR, "KumbhSans-Regular.ttf")
    b_path = os.path.join(_FONT_DIR, "KumbhSans-Bold.ttf")

    # Old Chrome UA — Google Fonts returns TTF (not woff2) for this agent
    _ua = (
        "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.30 "
        "(KHTML, like Gecko) Chrome/12.0.742.122 Safari/534.30"
    )

    def _fetch_ttf(weight: int, dest: str) -> bool:
        if os.path.exists(dest):
            return True
        try:
            url = f"https://fonts.googleapis.com/css?family=Kumbh+Sans:{weight}"
            req = urllib.request.Request(url, headers={"User-Agent": _ua})
            css = urllib.request.urlopen(req, timeout=12).read().decode("utf-8")
            m = _re.search(r"url\(([^)]+\.ttf[^)]*)\)", css)
            if not m:
                return False
            font_url = m.group(1).strip("'\"")
            urllib.request.urlretrieve(font_url, dest)
            return True
        except Exception as exc:
            print(f"[fonts] Download failed — {exc}")
            return False

    if _fetch_ttf(400, r_path) and _fetch_ttf(700, b_path):
        try:
            pdfmetrics.registerFont(TTFont("KumbhSans",      r_path))
            pdfmetrics.registerFont(TTFont("KumbhSans-Bold", b_path))
            _FONT_REG  = "KumbhSans"
            _FONT_BOLD = "KumbhSans-Bold"
            print("[fonts] Kumbh Sans loaded OK")
        except Exception as exc:
            print(f"[fonts] Registration failed — {exc}; falling back to Helvetica")
    else:
        print("[fonts] Using Helvetica fallback")

_setup_fonts()

# --------------------------------------------------
# Load Environment
# --------------------------------------------------
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# --------------------------------------------------
# FastAPI App
# --------------------------------------------------
app = FastAPI()

app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# Invoice Folder
# --------------------------------------------------
if not os.path.exists("invoices"):
    os.makedirs("invoices")

app.mount("/invoices", StaticFiles(directory="invoices"), name="invoices")

# --------------------------------------------------
# Session Storage
# --------------------------------------------------
sessions: Dict[str, dict] = {}

# --------------------------------------------------
# Models
# --------------------------------------------------
class StartSessionRequest(BaseModel):
    store: str
    product: str
    details: str


class MessageRequest(BaseModel):
    session_id: str
    message: str


# --------------------------------------------------
# Invoice Generator  —  Kumbh Sans · Premium Design
# --------------------------------------------------
def generate_invoice(session_id: str, session_data: dict):

    filename = f"invoices/{session_id}.pdf"
    W, H = A4  # 595.28 × 841.89 pt

    # ── Palette ──────────────────────────────────────────────
    C_INDIGO_DEEP   = HexColor("#1E1B4B")   # very dark indigo  (table header bg)
    C_INDIGO_MID    = HexColor("#4F46E5")   # indigo            (accent bar, badges)
    C_CYAN          = HexColor("#06B6D4")   # cyan              (thin top stripe)
    C_INK           = HexColor("#0F172A")   # near-black        (primary text)
    C_DARK          = HexColor("#1E293B")   # dark slate        (secondary headings)
    C_MED           = HexColor("#334155")   # medium slate      (body text)
    C_SOFT          = HexColor("#64748B")   # muted slate       (labels, notes)
    C_BORDER        = HexColor("#CBD5E1")   # light border
    C_ROW_ALT       = HexColor("#F5F3FF")   # very light lavender (alt rows)
    C_ROW_LABEL     = HexColor("#F8FAFC")   # near-white        (label column bg)
    C_META_BG       = HexColor("#EEF2FF")   # light indigo      (meta info box)
    C_GREEN_BG      = HexColor("#ECFDF5")   # light mint        (confirmed box bg)
    C_GREEN_TEXT    = HexColor("#065F46")   # dark emerald      (confirmed text)
    C_GREEN_BADGE   = HexColor("#059669")   # emerald           (confirmed accent)
    C_PAGE_BG       = HexColor("#FAFAFA")   # off-white page bg
    C_WHITE         = colors.white
    # ─────────────────────────────────────────────────────────

    now       = datetime.datetime.now()
    date_str  = now.strftime("%B %d, %Y")
    time_str  = now.strftime("%I:%M %p")

    # ── Paragraph styles ─────────────────────────────────────
    def ps(name, font=None, size=10, color=None, align=TA_LEFT,
           leading=None, space_before=0, space_after=0, bold=False):
        fn = font or (_FONT_BOLD if bold else _FONT_REG)
        return ParagraphStyle(
            name,
            fontName=fn,
            fontSize=size,
            textColor=color or C_MED,
            alignment=align,
            leading=leading or (size * 1.45),
            spaceBefore=space_before,
            spaceAfter=space_after,
        )

    s_label     = ps("label",     bold=True,  size=8.5,  color=C_SOFT)
    s_value     = ps("value",     bold=False, size=10.5, color=C_INK)
    s_th        = ps("th",        bold=True,  size=9.5,  color=C_WHITE, align=TA_LEFT)
    s_td_key    = ps("td_key",    bold=True,  size=10,   color=C_DARK)
    s_td_val    = ps("td_val",    bold=False, size=10,   color=C_MED)
    s_confirmed = ps("confirmed", bold=True,  size=13,   color=C_GREEN_TEXT, align=TA_CENTER)
    s_conf_lbl  = ps("conf_lbl",  bold=True,  size=7.5,  color=C_GREEN_BADGE,
                     align=TA_CENTER, space_after=3)
    s_note      = ps("note",      bold=False, size=8.5,  color=C_SOFT, align=TA_CENTER,
                     leading=14, space_after=3)
    s_note_bold = ps("note_b",    bold=True,  size=8.5,  color=C_SOFT, align=TA_CENTER)
    # ─────────────────────────────────────────────────────────

    def _cell(text, style, pad_t=11, pad_b=11, pad_l=14, pad_r=14):
        """Wrap paragraph in single-cell table for consistent padding."""
        t = Table([[Paragraph(text, style)]], colWidths=None)
        t.setStyle(TableStyle([
            ("TOPPADDING",    (0,0), (-1,-1), pad_t),
            ("BOTTOMPADDING", (0,0), (-1,-1), pad_b),
            ("LEFTPADDING",   (0,0), (-1,-1), pad_l),
            ("RIGHTPADDING",  (0,0), (-1,-1), pad_r),
        ]))
        return t

    # ── Canvas decorations (header + footer) ─────────────────
    def add_page_decorations(c: canvas.Canvas, doc):
        c.saveState()

        # ── Subtle off-white page background ──
        c.setFillColor(C_PAGE_BG)
        c.rect(0, 0, W, H, fill=1, stroke=0)

        # ── Top accent bar: indigo (left 65 %) + cyan (right 35 %) ──
        c.setFillColor(C_INDIGO_MID)
        c.rect(0, H - 6, W * 0.65, 6, fill=1, stroke=0)
        c.setFillColor(C_CYAN)
        c.rect(W * 0.65, H - 6, W * 0.35, 6, fill=1, stroke=0)

        # ── Header background (very subtle) ──
        c.setFillColor(HexColor("#FFFFFF"))
        c.rect(0, H - 88, W, 82, fill=1, stroke=0)

        # ── Logo badge (filled circle) ──
        c.setFillColor(C_INDIGO_MID)
        c.circle(62, H - 44, 20, fill=1, stroke=0)
        c.setFillColor(C_WHITE)
        c.setFont(_FONT_BOLD, 11)
        c.drawCentredString(62, H - 49, "AI")

        # ── Company name + tagline ──
        c.setFillColor(C_INK)
        c.setFont(_FONT_BOLD, 15)
        c.drawString(92, H - 35, "AI VOICE ASSISTANT")

        c.setFillColor(C_SOFT)
        c.setFont(_FONT_REG, 8.5)
        c.drawString(92, H - 52, "Intelligent Booking & Appointment System")

        # ── INVOICE label (right-aligned) ──
        c.setFillColor(C_SOFT)
        c.setFont(_FONT_REG, 7.5)
        c.drawRightString(W - 45, H - 30, "B O O K I N G   I N V O I C E")

        # ── Invoice number ──
        c.setFillColor(C_INDIGO_MID)
        c.setFont(_FONT_BOLD, 11)
        c.drawRightString(W - 45, H - 49, f"# {session_id}")

        # ── Header bottom rule ──
        c.setStrokeColor(C_BORDER)
        c.setLineWidth(0.75)
        c.line(45, H - 78, W - 45, H - 78)

        # ── Thin indigo accent left-side rule (decorative) ──
        c.setStrokeColor(C_INDIGO_MID)
        c.setLineWidth(2.5)
        c.line(45, H - 82, 45, H - 78)

        # ── Footer background ──
        c.setFillColor(HexColor("#F1F5F9"))
        c.rect(0, 0, W, 50, fill=1, stroke=0)
        c.setStrokeColor(C_BORDER)
        c.setLineWidth(0.6)
        c.line(0, 50, W, 50)

        # ── Footer accent bar ──
        c.setFillColor(C_INDIGO_MID)
        c.rect(0, 48, W * 0.65, 2, fill=1, stroke=0)
        c.setFillColor(C_CYAN)
        c.rect(W * 0.65, 48, W * 0.35, 2, fill=1, stroke=0)

        # ── Footer text ──
        c.setFillColor(C_SOFT)
        c.setFont(_FONT_BOLD, 8)
        c.drawCentredString(W / 2, 32, "AI Voice Assistant  ·  Intelligent Booking & Appointment System")
        c.setFont(_FONT_REG, 7.5)
        c.setFillColor(HexColor("#94A3B8"))
        c.drawCentredString(
            W / 2, 16,
            "Thank you for choosing our service. Bring this invoice to your appointment."
        )

        c.restoreState()

    # ── Document ─────────────────────────────────────────────
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        topMargin=100,
        bottomMargin=62,
        leftMargin=45,
        rightMargin=45,
    )

    CONTENT_W = W - 90  # 45 + 45 margins  → 505.28 pt
    COL1 = CONTENT_W * 0.34  # label column  ~172 pt
    COL2 = CONTENT_W * 0.66  # value column  ~333 pt

    elements = []

    # ── ① Meta info row (invoice details | status badge) ────
    # Left: invoice metadata
    meta_rows = [
        [Paragraph("INVOICE #", s_label),  Paragraph(session_id,  s_value)],
        [Paragraph("DATE",       s_label),  Paragraph(date_str,    s_value)],
        [Paragraph("TIME",       s_label),  Paragraph(time_str,    s_value)],
    ]
    meta_left = Table(meta_rows, colWidths=[0.9 * inch, 2.5 * inch])
    meta_left.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), C_META_BG),
        ("TOPPADDING",    (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ("LEFTPADDING",   (0, 0), (-1, -1), 14),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 14),
        ("LINEBELOW",     (0, 0), (-1, -2), 0.5, HexColor("#C7D2FE")),
        ("BOX",           (0, 0), (-1, -1), 0.8, HexColor("#C7D2FE")),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))

    # Right: CONFIRMED badge
    confirmed_rows = [
        [Paragraph("BOOKING STATUS", s_conf_lbl)],
        [Paragraph("CONFIRMED",       s_confirmed)],
    ]
    meta_right = Table(confirmed_rows, colWidths=[1.85 * inch])
    meta_right.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (0, 0), C_GREEN_BADGE),
        ("BACKGROUND",    (0, 1), (0, 1), C_GREEN_BG),
        ("TOPPADDING",    (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("ALIGN",         (0, 0), (-1, -1), "CENTER"),
        ("BOX",           (0, 0), (-1, -1), 1.2, C_GREEN_BADGE),
        ("LINEBELOW",     (0, 0), (0, 0),   1.5, C_GREEN_BADGE),
    ]))

    outer_meta = Table(
        [[meta_left, "", meta_right]],
        colWidths=[3.55 * inch, 0.25 * inch, 1.85 * inch],
    )
    outer_meta.setStyle(TableStyle([
        ("VALIGN",      (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING",(0, 0), (-1, -1), 0),
        ("TOPPADDING",  (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING",(0, 0),(-1, -1), 0),
    ]))

    elements.append(outer_meta)
    elements.append(Spacer(1, 0.32 * inch))

    # ── ② Section header: BOOKING DETAILS ───────────────────
    # Indigo left-bar accent + title on light-indigo background
    section_data = [["", Paragraph("BOOKING DETAILS", ps("sh", bold=True, size=9,
                                                           color=C_INDIGO_MID,
                                                           space_before=0, space_after=0))]]
    section_hdr = Table(section_data, colWidths=[5, CONTENT_W - 5])
    section_hdr.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (0, 0), C_INDIGO_MID),
        ("BACKGROUND",    (1, 0), (1, 0), C_META_BG),
        ("TOPPADDING",    (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ("LEFTPADDING",   (1, 0), (1, 0), 13),
        ("LEFTPADDING",   (0, 0), (0, 0), 0),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 12),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))

    elements.append(section_hdr)
    elements.append(Spacer(1, 4))

    # ── ③ Booking details table ──────────────────────────────
    def _row(label: str, value: str, alt: bool):
        row_bg = C_ROW_ALT if alt else C_WHITE
        return [
            Paragraph(label, s_td_key),
            Paragraph(value or "—", s_td_val),
        ], row_bg

    rows_raw = [
        ("Store",            session_data.get("store",    "—")),
        ("Product / Service",session_data.get("product",  "—")),
        ("Service Details",  session_data.get("details",  "—")),
        ("Appointment Date", session_data.get("appointment_date", "To be confirmed")),
        ("Appointment Time", session_data.get("appointment_time", "To be confirmed")),
    ]

    table_data = [
        [Paragraph("Field",       s_th),
         Paragraph("Information", s_th)],
    ]
    row_styles = [
        ("BACKGROUND",    (0, 0), (-1, 0), C_INDIGO_DEEP),
        ("TEXTCOLOR",     (0, 0), (-1, 0), C_WHITE),
        ("TOPPADDING",    (0, 0), (-1, 0), 13),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 13),
        ("LEFTPADDING",   (0, 0), (-1, 0), 15),
        ("RIGHTPADDING",  (0, 0), (-1, 0), 15),
        ("LINEBELOW",     (0, 0), (-1, 0), 2.5, C_INDIGO_MID),
    ]

    for i, (label, value) in enumerate(rows_raw):
        row, bg = _row(label, value, alt=(i % 2 == 1))
        table_data.append(row)
        ri = i + 1
        row_styles += [
            ("BACKGROUND",    (0, ri), (0, ri),  C_ROW_LABEL),
            ("BACKGROUND",    (1, ri), (1, ri),  bg),
            ("TOPPADDING",    (0, ri), (-1, ri), 11),
            ("BOTTOMPADDING", (0, ri), (-1, ri), 11),
            ("LEFTPADDING",   (0, ri), (-1, ri), 15),
            ("RIGHTPADDING",  (0, ri), (-1, ri), 15),
        ]

    row_styles += [
        ("FONTNAME",  (0, 1), (-1, -1), _FONT_REG),
        ("GRID",      (0, 0), (-1, -1), 0.5, C_BORDER),
        ("BOX",       (0, 0), (-1, -1), 1.2, C_BORDER),
        ("VALIGN",    (0, 0), (-1, -1), "MIDDLE"),
    ]

    booking_table = Table(table_data, colWidths=[COL1, COL2])
    booking_table.setStyle(TableStyle(row_styles))
    elements.append(booking_table)
    elements.append(Spacer(1, 0.35 * inch))

    # ── ④ Notes ──────────────────────────────────────────────
    notes_table = Table(
        [[Paragraph(
            "<b>Important:</b>  Bring this invoice to your appointment. "
            "For changes or cancellations please contact the store at least "
            "24 hours in advance.",
            ps("notes_p", size=8.5, color=C_SOFT, align=TA_CENTER, leading=13)
        )]],
        colWidths=[CONTENT_W],
    )
    notes_table.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), HexColor("#F1F5F9")),
        ("BOX",           (0, 0), (-1, -1), 0.6, C_BORDER),
        ("TOPPADDING",    (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING",   (0, 0), (-1, -1), 18),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 18),
    ]))
    elements.append(notes_table)

    # ── Build ─────────────────────────────────────────────────
    doc.build(
        elements,
        onFirstPage=add_page_decorations,
        onLaterPages=add_page_decorations,
    )

    print(f"[invoice] Created: {filename}")
    return filename


# --------------------------------------------------
# Start Session
# --------------------------------------------------
@app.post("/session/start")
def start_session(data: StartSessionRequest):

    session_id = f"{data.store.replace(' ', '_')}-{len(sessions) + 1}"

    sessions[session_id] = {
        "store": data.store,
        "product": data.product,
        "details": data.details,
        "history": [],
        "invoice_generated": False,
        "invoice_url": None,
        "appointment_date": None,
        "appointment_time": None,
    }

    return {
        "session_id": session_id,
        "assistant_message": f"Hello. I am contacting {data.store} regarding {data.product}. Let me begin.",
    }


# --------------------------------------------------
# Handle Message
# --------------------------------------------------
@app.post("/session/message")
def handle_message(data: MessageRequest):

    session = sessions.get(data.session_id)

    if not session:
        return {"error": "Invalid session"}

    session["history"].append(
        {"role": "user", "content": data.message}
    )

    messages = [
        {
            "role": "system",
            "content": f"""
You are a professional booking assistant helping customers schedule appointments.

Today's Date: {datetime.datetime.now().strftime('%B %d, %Y')} ({datetime.datetime.now().strftime('%Y-%m-%d')})

Booking Context:
Store: {session['store']}
Product: {session['product']}
Details: {session['details']}

Your Task:
1. Ask for the customer's preferred appointment date and time
2. Accept dates in any format (e.g., "March 2nd", "03/02/2026", "2nd March 2026")
3. Appointments should be scheduled for FUTURE dates (today or later, within the next 3 months)
4. Be friendly, helpful, and understanding
5. Once date and time are confirmed, set completed=true

Respond ONLY in valid JSON format:

{{
  "reply": "your friendly response to the customer",
  "completed": true or false,
  "appointment_date": "YYYY-MM-DD or null",
  "appointment_time": "HH:MM or null"
}}

Important Rules:
- Accept future dates for appointments (appointments are meant to be in the future!)
- Parse dates flexibly - understand various date formats
- When the customer provides a date, confirm it in a friendly way
- Format appointment_date as YYYY-MM-DD (e.g., 2026-03-02 for March 2nd, 2026)
- Format appointment_time in 24-hour format (e.g., 18:00 for 6 PM)
- Set completed=true only when BOTH date AND time are confirmed
- Always return valid JSON
- Be conversational and helpful

Example Flow:
Customer: "March 2nd at 6pm"
Your reply: "Perfect! I've scheduled your appointment for March 2nd, 2026 at 6:00 PM. Is this correct?"
JSON: {{"reply": "...", "completed": true, "appointment_date": "2026-03-02", "appointment_time": "18:00"}}
"""
        }
    ]

    messages += session["history"]

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            response_format={"type": "json_object"},
        )

        raw_text = response.choices[0].message.content
        print("Raw LLM Output:", raw_text)

        parsed = json.loads(raw_text)

    except Exception as e:
        print("OpenAI / JSON Error:", e)
        parsed = {
            "reply": "Internal reasoning error. Please continue.",
            "completed": False,
            "appointment_date": None,
            "appointment_time": None,
        }

    print("Parsed JSON:", parsed)

    session["history"].append(
        {"role": "assistant", "content": parsed["reply"]}
    )

    # Save appointment
    if parsed.get("appointment_date"):
        session["appointment_date"] = parsed["appointment_date"]

    if parsed.get("appointment_time"):
        session["appointment_time"] = parsed["appointment_time"]

    # Generate invoice ONCE
    if parsed.get("completed") and not session["invoice_generated"]:

        invoice_path = generate_invoice(data.session_id, session)
        session["invoice_url"] = f"http://localhost:8001/{invoice_path}"
        session["invoice_generated"] = True

    return {
        "assistant_message": parsed["reply"],
        "completed": parsed.get("completed", False),
        "invoice_url": session["invoice_url"],
    }


class FeedbackRequest(BaseModel):
    message: str


class RewriteRequest(BaseModel):
    text: str


@app.post("/feedback")
def analyze_feedback(data: FeedbackRequest):
    """Analyze customer feedback for sentiment, rating, and summary"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """
You are a professional feedback analyzer.

Analyze the customer feedback and respond ONLY in JSON format:

{
  "sentiment": "positive" or "neutral" or "negative",
  "rating": 1-5 (integer),
  "summary": "brief summary of the feedback",
  "key_points": ["point 1", "point 2", "point 3"],
  "emotion": "happy" or "satisfied" or "neutral" or "disappointed" or "angry"
}

Rules:
- rating 5 = excellent/very positive
- rating 4 = good/positive
- rating 3 = okay/neutral
- rating 2 = poor/negative
- rating 1 = very poor/very negative
- summary should be 1-2 sentences
- key_points should be 2-4 main points from feedback
- Always return valid JSON
"""
                },
                {
                    "role": "user",
                    "content": f"Analyze this feedback: {data.message}"
                }
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
        )

        result = json.loads(response.choices[0].message.content)

        return {
            "sentiment": result.get("sentiment", "neutral"),
            "rating": result.get("rating", 3),
            "summary": result.get("summary", "Thank you for your feedback!"),
            "key_points": result.get("key_points", []),
            "emotion": result.get("emotion", "neutral")
        }

    except Exception as e:
        print("Feedback analysis error:", e)
        return {
            "sentiment": "neutral",
            "rating": 3,
            "summary": "Thank you for your feedback!",
            "key_points": ["Feedback received"],
            "emotion": "neutral"
        }


@app.post("/feedback/rewrite")
def rewrite_feedback(data: RewriteRequest):

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """
You are a professional writing assistant.

Rewrite the user's feedback to:
- Be clear
- Professional
- Well structured
- Polite
- Keep original meaning

Return only the improved version.
Do not add extra commentary.
"""
                },
                {
                    "role": "user",
                    "content": data.text
                }
            ],
            temperature=0.5,
        )

        improved = response.choices[0].message.content.strip()

        return {
            "improved_text": improved
        }

    except Exception as e:
        print("Rewrite error:", e)
        return {
            "improved_text": data.text
        }