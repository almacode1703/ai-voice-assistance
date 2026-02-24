from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------
# In-memory session store
# ------------------------

sessions: Dict[str, dict] = {}


# ------------------------
# Request Models
# ------------------------

class StartSessionRequest(BaseModel):
    store: str
    product: str
    details: str


class MessageRequest(BaseModel):
    session_id: str
    message: str


# ------------------------
# Start Session Endpoint
# ------------------------

@app.post("/session/start")
def start_session(data: StartSessionRequest):
    session_id = f"{data.store}-{len(sessions) + 1}"

    sessions[session_id] = {
        "step": 0,
        "store": data.store,
        "product": data.product,
        "details": data.details,
    }

    return {
        "session_id": session_id,
        "assistant_message": f"Hello. I am contacting {data.store} regarding {data.product}. Let me begin."
    }


# ------------------------
# Handle Message Endpoint
# ------------------------

@app.post("/session/message")
def handle_message(data: MessageRequest):
    session = sessions.get(data.session_id)

    if not session:
        return {"error": "Invalid session"}

    step = session["step"]

    if step == 0:
        response = "Could you please tell me the cost per person?"
        session["step"] = 1

    elif step == 1:
        response = "Is the requested time slot available?"
        session["step"] = 2

    elif step == 2:
        response = "Please provide the name for the reservation."
        session["step"] = 3

    elif step == 3:
        response = "Reservation confirmed. The booking has been completed successfully."
        session["step"] = 4

    else:
        response = "This session has been completed."

    return {
        "assistant_message": response
    }