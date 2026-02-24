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
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch

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

    doc = SimpleDocTemplate(filename, pagesize=A4)
    elements = []
    styles = getSampleStyleSheet()

    elements.append(Paragraph("INVOICE", styles["Title"]))
    elements.append(Spacer(1, 0.5 * inch))

    elements.append(Paragraph(f"Invoice ID: {session_id}", styles["Normal"]))
    elements.append(
        Paragraph(
            f"Created On: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}",
            styles["Normal"],
        )
    )

    elements.append(Spacer(1, 0.5 * inch))

    data = [
        ["Store", session_data["store"]],
        ["Product", session_data["product"]],
        ["Details", session_data["details"]],
        ["Appointment Date", session_data.get("appointment_date", "")],
        ["Appointment Time", session_data.get("appointment_time", "")],
        ["Status", "Confirmed"],
    ]

    table = Table(data, colWidths=[2.5 * inch, 3 * inch])
    elements.append(table)

    elements.append(Spacer(1, 1 * inch))
    elements.append(Paragraph("Thank you for choosing our service.", styles["Normal"]))

    doc.build(elements)

    print(f"Invoice created: {filename}")

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
You are a professional booking assistant.

Context:
Store: {session['store']}
Product: {session['product']}
Details: {session['details']}

Respond ONLY in JSON:

{{
  "reply": "assistant reply",
  "completed": true or false,
  "appointment_date": "YYYY-MM-DD or null",
  "appointment_time": "HH:MM or null"
}}

Rules:
- When booking is confirmed, set completed=true.
- Always return valid JSON.
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