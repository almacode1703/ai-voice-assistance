from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Dict
import os
import json
import datetime
from dotenv import load_dotenv
from openai import OpenAI

# PDF
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.pdfgen import canvas

# --------------------------------------------------
# Load Environment
# --------------------------------------------------
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# --------------------------------------------------
# FastAPI App
# --------------------------------------------------
app = FastAPI()

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
# Invoice Generator
# --------------------------------------------------
def generate_invoice(session_id: str, session_data: dict):

    filename = f"invoices/{session_id}.pdf"

    # Custom page template with header and footer
    def add_page_decorations(canvas, doc):
        canvas.saveState()

        # Header - Gradient-like effect with colored bars
        canvas.setFillColor(colors.HexColor('#22d3ee'))  # Cyan
        canvas.rect(0, A4[1] - 60, A4[0], 20, fill=1, stroke=0)

        canvas.setFillColor(colors.HexColor('#ec4899'))  # Pink
        canvas.rect(0, A4[1] - 80, A4[0], 20, fill=1, stroke=0)

        canvas.setFillColor(colors.HexColor('#facc15'))  # Yellow
        canvas.rect(0, A4[1] - 100, A4[0], 20, fill=1, stroke=0)

        # Company Name in Header
        canvas.setFillColor(colors.white)
        canvas.setFont('Helvetica-Bold', 24)
        canvas.drawString(50, A4[1] - 50, "AI VOICE ASSISTANT")

        canvas.setFont('Helvetica', 10)
        canvas.drawString(50, A4[1] - 90, "Intelligent Booking & Service Solutions")

        # Footer
        canvas.setFillColor(colors.HexColor('#1e293b'))  # Dark slate
        canvas.rect(0, 0, A4[0], 50, fill=1, stroke=0)

        canvas.setFillColor(colors.white)
        canvas.setFont('Helvetica', 9)
        canvas.drawCentredString(A4[0] / 2, 30, "Powered by AI Technology")
        canvas.drawCentredString(A4[0] / 2, 15, "Thank you for choosing our service!")

        canvas.restoreState()

    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        topMargin=120,
        bottomMargin=70,
        leftMargin=50,
        rightMargin=50
    )

    elements = []
    styles = getSampleStyleSheet()

    # Custom Styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=32,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )

    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#0ea5e9'),
        spaceAfter=12,
        fontName='Helvetica-Bold'
    )

    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#334155'),
        spaceAfter=10
    )

    # Invoice Title
    elements.append(Paragraph("INVOICE", title_style))
    elements.append(Spacer(1, 0.3 * inch))

    # Invoice Info Box
    invoice_info_data = [
        [Paragraph("<b>Invoice Number:</b>", normal_style), Paragraph(f"<b>{session_id}</b>", normal_style)],
        [Paragraph("<b>Date Issued:</b>", normal_style), Paragraph(datetime.datetime.now().strftime('%B %d, %Y'), normal_style)],
        [Paragraph("<b>Time:</b>", normal_style), Paragraph(datetime.datetime.now().strftime('%I:%M %p'), normal_style)],
    ]

    invoice_info_table = Table(invoice_info_data, colWidths=[2 * inch, 3.5 * inch])
    invoice_info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0f9ff')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1e293b')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#bae6fd')),
    ]))

    elements.append(invoice_info_table)
    elements.append(Spacer(1, 0.4 * inch))

    # Booking Details Section
    elements.append(Paragraph("BOOKING DETAILS", heading_style))
    elements.append(Spacer(1, 0.1 * inch))

    # Main Details Table with colors
    booking_data = [
        [
            Paragraph("<b>Field</b>", ParagraphStyle('TableHeader', parent=normal_style, textColor=colors.white, alignment=TA_CENTER)),
            Paragraph("<b>Information</b>", ParagraphStyle('TableHeader', parent=normal_style, textColor=colors.white, alignment=TA_CENTER))
        ],
        [Paragraph("<b>Store Name</b>", normal_style), Paragraph(session_data["store"], normal_style)],
        [Paragraph("<b>Product/Service</b>", normal_style), Paragraph(session_data["product"], normal_style)],
        [Paragraph("<b>Service Details</b>", normal_style), Paragraph(session_data["details"], normal_style)],
        [Paragraph("<b>Appointment Date</b>", normal_style), Paragraph(session_data.get("appointment_date", "To be confirmed"), normal_style)],
        [Paragraph("<b>Appointment Time</b>", normal_style), Paragraph(session_data.get("appointment_time", "To be confirmed"), normal_style)],
    ]

    booking_table = Table(booking_data, colWidths=[2 * inch, 3.5 * inch])
    booking_table.setStyle(TableStyle([
        # Header row
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0ea5e9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 15),
        ('TOPPADDING', (0, 0), (-1, 0), 15),

        # Data rows - alternating colors
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#cffafe')),
        ('BACKGROUND', (0, 2), (-1, 2), colors.white),
        ('BACKGROUND', (0, 3), (-1, 3), colors.HexColor('#cffafe')),
        ('BACKGROUND', (0, 4), (-1, 4), colors.white),
        ('BACKGROUND', (0, 5), (-1, 5), colors.HexColor('#cffafe')),

        ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#1e293b')),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 12),
        ('TOPPADDING', (0, 1), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 15),
        ('RIGHTPADDING', (0, 0), (-1, -1), 15),

        ('GRID', (0, 0), (-1, -1), 1.5, colors.HexColor('#0ea5e9')),
        ('LINEBELOW', (0, 0), (-1, 0), 2, colors.HexColor('#0284c7')),
    ]))

    elements.append(booking_table)
    elements.append(Spacer(1, 0.4 * inch))

    # Status Badge
    status_data = [
        [
            Paragraph("<b>BOOKING STATUS</b>", ParagraphStyle('Status', parent=normal_style, textColor=colors.white, fontSize=12, alignment=TA_CENTER))
        ],
        [
            Paragraph("✓ CONFIRMED", ParagraphStyle('StatusValue', parent=title_style, textColor=colors.HexColor('#10b981'), fontSize=20, alignment=TA_CENTER))
        ]
    ]

    status_table = Table(status_data, colWidths=[5.5 * inch])
    status_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#059669')),
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#d1fae5')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
        ('TOPPADDING', (0, 0), (-1, -1), 15),
        ('GRID', (0, 0), (-1, -1), 2, colors.HexColor('#059669')),
    ]))

    elements.append(status_table)
    elements.append(Spacer(1, 0.5 * inch))

    # Important Notes
    notes_style = ParagraphStyle(
        'Notes',
        parent=normal_style,
        fontSize=9,
        textColor=colors.HexColor('#64748b'),
        alignment=TA_CENTER,
        spaceAfter=6
    )

    elements.append(Paragraph("<b>Important Notes:</b>", notes_style))
    elements.append(Paragraph("Please bring this invoice to your appointment.", notes_style))
    elements.append(Paragraph("For any changes or cancellations, please contact us 24 hours in advance.", notes_style))

    # Build PDF with custom page template
    doc.build(elements, onFirstPage=add_page_decorations, onLaterPages=add_page_decorations)

    print(f"✨ Professional invoice created: {filename}")

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
        session["invoice_url"] = f"http://localhost:8000/{invoice_path}"
        session["invoice_generated"] = True

    return {
        "assistant_message": parsed["reply"],
        "completed": parsed.get("completed", False),
        "invoice_url": session["invoice_url"],
    }