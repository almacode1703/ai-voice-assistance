from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import JWTError, jwt
from datetime import datetime, timedelta
import bcrypt
import json
import os
import uuid
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# --------------------------------------------------
# Config
# --------------------------------------------------
router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


SECRET_KEY = os.getenv("AUTH_SECRET_KEY", "ai-voice-assistant-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

USERS_FILE = os.path.join(os.path.dirname(__file__), "data", "users.json")

# In-memory store for pending registrations (email -> registration data + OTP)
pending_registrations: dict = {}


# --------------------------------------------------
# Models
# --------------------------------------------------
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class SendOTPRequest(BaseModel):
    name: str
    email: str
    password: str


class VerifyOTPRequest(BaseModel):
    email: str
    otp: str


# --------------------------------------------------
# Storage Helpers
# --------------------------------------------------
def get_users() -> list:
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r") as f:
        return json.load(f)


def save_users(users: list):
    os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)


# --------------------------------------------------
# JWT Helpers
# --------------------------------------------------
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# --------------------------------------------------
# Email Sender
# --------------------------------------------------
def send_otp_email(to_email: str, name: str, otp: str):
    gmail_user = os.getenv("GMAIL_USER")
    gmail_password = os.getenv("GMAIL_APP_PASSWORD")

    if not gmail_user or not gmail_password:
        # Dev mode: print OTP to console instead of sending email
        print(f"[OTP] Email not configured — OTP for {to_email}: {otp}")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Your verification code — AI Voice Assistant"
    msg["From"] = f"AI Voice Assistant <{gmail_user}>"
    msg["To"] = to_email

    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="480" cellpadding="0" cellspacing="0"
              style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
              <tr>
                <td style="background:linear-gradient(135deg,#06b6d4,#8b5cf6,#ec4899);padding:4px 0;"></td>
              </tr>
              <tr>
                <td style="padding:32px 40px 20px;text-align:center;">
                  <div style="display:inline-flex;align-items:center;justify-content:center;
                    background:linear-gradient(135deg,#06b6d4,#ec4899);
                    width:56px;height:56px;border-radius:14px;font-size:26px;margin-bottom:18px;">✨</div>
                  <h1 style="color:#f8fafc;font-size:22px;margin:0 0 8px;font-weight:700;">Verify your email</h1>
                  <p style="color:#94a3b8;font-size:14px;margin:0;line-height:1.6;">
                    Hi <strong style="color:#e2e8f0;">{name}</strong>, use the code below to complete your registration.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 40px 32px;text-align:center;">
                  <div style="background:#0f172a;border:2px solid #06b6d4;border-radius:16px;padding:28px 20px;">
                    <p style="color:#94a3b8;font-size:11px;text-transform:uppercase;
                      letter-spacing:3px;margin:0 0 14px;font-weight:600;">Your verification code</p>
                    <div style="font-size:44px;font-weight:800;letter-spacing:16px;
                      color:#67e8f9;font-family:'Courier New',monospace;padding-left:16px;">{otp}</div>
                    <p style="color:#64748b;font-size:12px;margin:16px 0 0;">
                      Expires in <strong style="color:#94a3b8;">10 minutes</strong>
                    </p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:0 40px 32px;text-align:center;">
                  <p style="color:#475569;font-size:12px;line-height:1.7;margin:0;">
                    If you didn't request this, you can safely ignore this email.<br>
                    This code is valid for one-time use only.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background:linear-gradient(135deg,#ec4899,#8b5cf6,#06b6d4);padding:3px 0;"></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """

    plain = f"Hi {name},\n\nYour AI Voice Assistant verification code is: {otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, ignore this email."

    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(gmail_user, gmail_password)
            server.sendmail(gmail_user, to_email, msg.as_string())
        print(f"[OTP] Email sent to {to_email}")
    except Exception as e:
        print(f"[OTP] Failed to send email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send OTP email. Please check your Gmail configuration.")


# --------------------------------------------------
# Routes
# --------------------------------------------------
@router.post("/send-otp")
def send_otp(data: SendOTPRequest):
    """Validate registration data, send OTP to email."""

    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    users = get_users()
    if any(u["email"].lower() == data.email.lower() for u in users):
        raise HTTPException(status_code=400, detail="Email already registered")

    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    expires_at = (datetime.utcnow() + timedelta(minutes=10)).isoformat()

    # Store pending registration
    pending_registrations[data.email.lower().strip()] = {
        "name": data.name.strip(),
        "email": data.email.lower().strip(),
        "password_hash": hash_password(data.password),
        "otp": otp,
        "expires_at": expires_at,
    }

    send_otp_email(data.email, data.name.strip(), otp)

    return {"message": "OTP sent to your email"}


@router.post("/verify-otp")
def verify_otp(data: VerifyOTPRequest):
    """Verify OTP and create the user account."""

    email = data.email.lower().strip()
    pending = pending_registrations.get(email)

    if not pending:
        raise HTTPException(
            status_code=400,
            detail="No pending registration found. Please start registration again."
        )

    # Check expiry
    if datetime.utcnow() > datetime.fromisoformat(pending["expires_at"]):
        del pending_registrations[email]
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    # Check OTP
    if pending["otp"] != data.otp.strip():
        raise HTTPException(status_code=400, detail="Incorrect OTP. Please try again.")

    # Race condition guard
    users = get_users()
    if any(u["email"].lower() == email for u in users):
        del pending_registrations[email]
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create account
    user = {
        "id": str(uuid.uuid4()),
        "name": pending["name"],
        "email": pending["email"],
        "password_hash": pending["password_hash"],
        "created_at": datetime.utcnow().isoformat(),
        "email_verified": True,
    }

    users.append(user)
    save_users(users)
    del pending_registrations[email]

    return {"message": "Account created successfully"}


@router.post("/register")
def register(data: RegisterRequest):
    users = get_users()

    if any(u["email"].lower() == data.email.lower() for u in users):
        raise HTTPException(status_code=400, detail="Email already registered")

    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    user = {
        "id": str(uuid.uuid4()),
        "name": data.name.strip(),
        "email": data.email.lower().strip(),
        "password_hash": hash_password(data.password),
        "created_at": datetime.utcnow().isoformat(),
    }

    users.append(user)
    save_users(users)

    token = create_access_token({
        "sub": user["id"],
        "email": user["email"],
        "name": user["name"],
    })

    return {
        "token": token,
        "user": {"id": user["id"], "name": user["name"], "email": user["email"]},
    }


@router.post("/login")
def login(data: LoginRequest):
    users = get_users()

    user = next((u for u in users if u["email"].lower() == data.email.lower().strip()), None)

    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({
        "sub": user["id"],
        "email": user["email"],
        "name": user["name"],
    })

    return {
        "token": token,
        "user": {"id": user["id"], "name": user["name"], "email": user["email"]},
    }


@router.get("/me")
def get_me(user_id: str = Depends(verify_token)):
    users = get_users()
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user["id"], "name": user["name"], "email": user["email"]}
