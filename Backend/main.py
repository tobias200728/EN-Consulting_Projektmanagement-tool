from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import models
from database import engine, SessionLocal, Base
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import pyotp
from urllib.parse import quote
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Form
import qrcode
from fastapi.responses import StreamingResponse
from io import BytesIO
import time
import random
import string
from email_service import send_password_reset_email


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


models.Base.metadata.create_all(bind=engine)

# Password hashen
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


# 2FA (TOTP - Time Based One Time Password)
def generate_2fa_secret() -> str:
    return pyotp.random_base32()


def build_otpauth_url(secret: str, email: str, issuer: str = "ENConsultingApp") -> str:
    label = f"{issuer}:{email}"
    return (
        f"otpauth://totp/{quote(label)}"
        f"?secret={secret}&issuer={quote(issuer)}&digits=6"
    )


def generate_reset_code() -> str:
    """Generiert einen 6-stelligen Verification Code"""
    return ''.join(random.choices(string.digits, k=6))


# Pydantic Models
class UserData(BaseModel):
    email: EmailStr
    password: str
    role: str = "employee"


class TwoFASetupRequest(BaseModel):
    email: EmailStr


class TwoFASetupResponse(BaseModel):
    otpauth_url: str


class TwoFAVerifyRequest(BaseModel):
    email: EmailStr
    code: str


class TwoFALoginRequest(BaseModel):
    email: EmailStr
    code: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyResetCodeRequest(BaseModel):
    email: EmailStr
    code: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    email: EmailStr
    current_password: str
    new_password: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==================== USER MANAGEMENT ====================

@app.post("/adduser/")
async def create_user(userdata: UserData, db: Session = Depends(get_db)):
    try:
        # Prüfen, ob Email schon existiert
        existing_user = db.query(models.Users).filter(models.Users.email == userdata.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already exists")
        
        # Passwort hashen
        hashed_password = pwd_context.hash(userdata.password)
        
        # User erstellen
        db_user = models.Users(
            email=userdata.email,
            password=hashed_password,
            role=userdata.role
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return {"status": "ok", "message": "User created", "user_id": db_user.id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/getuserbyID/{user_id}")
async def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    result = db.query(models.Users).filter(models.Users.id == user_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Profil nicht gefunden")
    return {
        "id": result.id,
        "email": result.email,
        "first_name": result.first_name,
        "last_name": result.last_name,
        "role": result.role,
        "is_active": result.is_active
    }

@app.delete("/deleteuser/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    """
    Löscht einen User aus der Datenbank
    """
    user = db.query(models.Users).filter(models.Users.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        db.delete(user)
        db.commit()

        return {
            "status": "ok",
            "message": f"User {user.email} successfully deleted",
            "user_id": user_id
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting user: {str(e)}")

# ==================== LOGIN ====================

@app.post("/login")
async def login(
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.query(models.Users).filter(models.Users.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Profil nicht gefunden")
    
    if not pwd_context.verify(password, user.password):
        raise HTTPException(status_code=400, detail="Falsches Passwort")
    
    if user.twofa_enabled:
        return {
            "status": "2fa_required",
            "email": user.email,
            "user_id": user.id,
            "role": user.role,
        }
    else:
        return {
            "status": "ok",
            "message": "Login successful",
            "user_id": user.id,
            "role": user.role,
            "first_name": user.first_name,
            "last_name": user.last_name,
        }


@app.post("/login/2fa")
async def login_2fa(data: TwoFALoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.Users).filter(models.Users.email == data.email).first()

    if not user or not user.twofa_enabled or not user.twofa_secret:
        raise HTTPException(status_code=400, detail="2FA not enabled for this user")

    totp = pyotp.TOTP(user.twofa_secret)
    if not totp.verify(data.code):
        raise HTTPException(status_code=401, detail="Invalid 2FA code")

    return {
        "status": "ok",
        "message": "Login with 2FA successful",
        "user_id": user.id,
        "role": user.role,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }


# ==================== 2FA SETUP ====================

@app.post("/2fa/setup", response_model=TwoFASetupResponse)
async def setup_2fa(data: TwoFASetupRequest, db: Session = Depends(get_db)):
    user = db.query(models.Users).filter(models.Users.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Profil nicht gefunden")

    # Neues Secret erzeugen
    secret = generate_2fa_secret()
    user.twofa_secret = secret
    user.twofa_enabled = True
    db.commit()

    otpauth_url = build_otpauth_url(secret, user.email, issuer="ENConsultingApp")

    return TwoFASetupResponse(otpauth_url=otpauth_url)

@app.get("/2fa/qr/{email}")
async def get_2fa_qr(email: str, db: Session = Depends(get_db)):
    user = db.query(models.Users).filter(models.Users.email == email).first()
    if not user or not user.twofa_secret:
        raise HTTPException(status_code=404, detail="Profil nicht gefunden oder 2FA nicht aktiviert")

    otpauth_url = f"otpauth://totp/ENConsultingApp:{user.email}?secret={user.twofa_secret}&issuer=ENConsultingApp&digits=6"

    img = qrcode.make(otpauth_url)
    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return StreamingResponse(buf, media_type="image/png")

@app.get("/2fa/status/{email}")
async def check_2fa_status(email: str, db: Session = Depends(get_db)):
    """
    Prüft ob 2FA für einen User aktiviert ist
    """
    user = db.query(models.Users).filter(models.Users.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2FA ist aktiv wenn twofa_secret befüllt ist
    is_2fa_active = user.twofa_secret is not None and user.twofa_secret != ""

    return {
        "status": "ok",
        "email": user.email,
        "twofa_enabled": is_2fa_active
    }


# ==================== PASSWORD RESET ====================

@app.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Schritt 1: User gibt Email ein
    System generiert 6-stelligen Code und sendet ihn per Email
    """
    print(f"DEBUG: Forgot password request for email: {data.email}")
    
    user = db.query(models.Users).filter(models.Users.email == data.email).first()
    
    if not user:
        print(f"DEBUG: User with email {data.email} NOT FOUND in database!")
        # Aus Sicherheitsgründen: Nicht verraten, ob Email existiert
        return {
            "status": "ok",
            "message": "If this email exists, a reset code has been sent"
        }
    
    print(f"DEBUG: User found! Generating code...")
    
    # Generiere 6-stelligen Code
    reset_code = generate_reset_code()
    
    print(f"DEBUG: Generated code: {reset_code}")
    
    # Speichere Code mit Ablaufzeit (15 Minuten)
    user.reset_code = reset_code
    user.reset_code_expires = int(time.time()) + 900  # 15 Minuten
    db.commit()
    
    print(f"DEBUG: Sending email...")
    
    # Sende Email
    email_sent = send_password_reset_email(user.email, reset_code)
    
    if email_sent:
        print(f"✅ Password reset email sent successfully to {user.email}")
    else:
        print(f"⚠️  Email sending failed, but code is saved in database")
    
    return {
        "status": "ok",
        "message": "Reset code has been sent"
    }


@app.post("/verify-reset-code")
async def verify_reset_code(data: VerifyResetCodeRequest, db: Session = Depends(get_db)):
    """
    Schritt 2: User gibt den erhaltenen Code ein
    System prüft, ob Code korrekt und noch gültig ist
    """
    user = db.query(models.Users).filter(models.Users.email == data.email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Profil nicht gefunden")
    
    if not user.reset_code:
        raise HTTPException(status_code=400, detail="No reset code requested")
    
    # Prüfe ob Code abgelaufen ist
    if user.reset_code_expires < int(time.time()):
        user.reset_code = None
        user.reset_code_expires = None
        db.commit()
        raise HTTPException(status_code=400, detail="Reset code has expired")
    
    # Prüfe ob Code korrekt ist
    if user.reset_code != data.code:
        raise HTTPException(status_code=400, detail="Invalid reset code")
    
    return {
        "status": "ok",
        "message": "Code verified successfully"
    }


@app.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Schritt 3: User gibt neues Passwort ein
    System prüft Code nochmal und setzt neues Passwort
    """
    user = db.query(models.Users).filter(models.Users.email == data.email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Profil nicht gefunden")
    
    if not user.reset_code:
        raise HTTPException(status_code=400, detail="No reset code requested")
    
    # Prüfe ob Code abgelaufen ist
    if user.reset_code_expires < int(time.time()):
        user.reset_code = None
        user.reset_code_expires = None
        db.commit()
        raise HTTPException(status_code=400, detail="Reset code has expired")
    
    # Prüfe ob Code korrekt ist
    if user.reset_code != data.code:
        raise HTTPException(status_code=400, detail="Falscher Reset Code")
    
    # Setze neues Passwort
    user.password = pwd_context.hash(data.new_password)
    
    # Lösche Reset Code
    user.reset_code = None
    user.reset_code_expires = None
    
    db.commit()
    
    return {
        "status": "ok",
        "message": "Passwort wurde erfolgreich zurückgesetzt"
    }

@app.post("/change-password")
async def change_password(data: ChangePasswordRequest, db: Session = Depends(get_db)):
    """
    Ändert das Passwort eines Users nach Verifizierung des aktuellen Passworts
    """
    user = db.query(models.Users).filter(models.Users.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prüfe ob aktuelles Passwort korrekt ist
    if not pwd_context.verify(data.current_password, user.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    # Prüfe ob neues Passwort unterschiedlich zum alten ist
    if data.current_password == data.new_password:
        raise HTTPException(status_code=400, detail="New password must be different from current password")

    try:
        # Setze neues Passwort
        user.password = pwd_context.hash(data.new_password)
        db.commit()

        return {
            "status": "ok",
            "message": "Password has been changed successfully"
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error changing password: {str(e)}")


# ==================== HEALTH CHECK ====================

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "API is running"}