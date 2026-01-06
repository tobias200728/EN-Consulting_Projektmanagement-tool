"""Authentication Routes"""
from fastapi import APIRouter, HTTPException, Depends, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import pyotp, qrcode, time
from fastapi.responses import StreamingResponse
from io import BytesIO
from database import SessionLocal
import models
from utils.security import pwd_context, generate_2fa_secret, build_otpauth_url, generate_reset_code
from email_service import send_password_reset_email

router = APIRouter(tags=["Authentication"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class TwoFASetupRequest(BaseModel):
    email: EmailStr

class TwoFASetupResponse(BaseModel):
    otpauth_url: str

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

@router.post("/login")
async def login(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(models.Users).filter(models.Users.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not pwd_context.verify(password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    if user.twofa_enabled:
        return {"status": "2fa_required", "email": user.email, "user_id": user.id, "role": user.role}
    else:
        return {
            "status": "ok", "message": "Login successful",
            "user_id": user.id, "role": user.role,
            "first_name": user.first_name, "last_name": user.last_name
        }

@router.post("/login/2fa")
async def login_2fa(data: TwoFALoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.Users).filter(models.Users.email == data.email).first()
    if not user or not user.twofa_enabled or not user.twofa_secret:
        raise HTTPException(status_code=400, detail="2FA not enabled for this user")
    
    totp = pyotp.TOTP(user.twofa_secret)
    if not totp.verify(data.code):
        raise HTTPException(status_code=401, detail="Invalid 2FA code")
    
    return {
        "status": "ok", "message": "Login with 2FA successful",
        "user_id": user.id, "role": user.role,
        "first_name": user.first_name, "last_name": user.last_name
    }

@router.post("/2fa/setup", response_model=TwoFASetupResponse)
async def setup_2fa(data: TwoFASetupRequest, db: Session = Depends(get_db)):
    user = db.query(models.Users).filter(models.Users.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    secret = generate_2fa_secret()
    user.twofa_secret = secret
    user.twofa_enabled = True
    db.commit()
    
    otpauth_url = build_otpauth_url(secret, user.email, issuer="ENConsultingApp")
    return TwoFASetupResponse(otpauth_url=otpauth_url)

@router.get("/2fa/qr/{email}")
async def get_2fa_qr(email: str, db: Session = Depends(get_db)):
    user = db.query(models.Users).filter(models.Users.email == email).first()
    if not user or not user.twofa_secret:
        raise HTTPException(status_code=404, detail="User not found or 2FA not initialized")
    
    otpauth_url = f"otpauth://totp/ENConsultingApp:{user.email}?secret={user.twofa_secret}&issuer=ENConsultingApp&digits=6"
    img = qrcode.make(otpauth_url)
    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")

@router.get("/2fa/status/{email}")
async def check_2fa_status(email: str, db: Session = Depends(get_db)):
    user = db.query(models.Users).filter(models.Users.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    is_2fa_active = user.twofa_secret is not None and user.twofa_secret != ""
    return {"status": "ok", "email": user.email, "twofa_enabled": is_2fa_active}

@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.Users).filter(models.Users.email == data.email).first()
    if not user:
        return {"status": "ok", "message": "If this email exists, a reset code has been sent"}
    
    reset_code = generate_reset_code()
    user.reset_code = reset_code
    user.reset_code_expires = int(time.time()) + 900
    db.commit()
    
    send_password_reset_email(user.email, reset_code)
    return {"status": "ok", "message": "Reset code has been sent"}

@router.post("/verify-reset-code")
async def verify_reset_code(data: VerifyResetCodeRequest, db: Session = Depends(get_db)):
    user = db.query(models.Users).filter(models.Users.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.reset_code:
        raise HTTPException(status_code=400, detail="No reset code requested")
    if user.reset_code_expires < int(time.time()):
        user.reset_code = None
        user.reset_code_expires = None
        db.commit()
        raise HTTPException(status_code=400, detail="Reset code has expired")
    if user.reset_code != data.code:
        raise HTTPException(status_code=400, detail="Invalid reset code")
    return {"status": "ok", "message": "Code verified successfully"}

@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.Users).filter(models.Users.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.reset_code:
        raise HTTPException(status_code=400, detail="No reset code requested")
    if user.reset_code_expires < int(time.time()):
        user.reset_code = None
        user.reset_code_expires = None
        db.commit()
        raise HTTPException(status_code=400, detail="Reset code has expired")
    if user.reset_code != data.code:
        raise HTTPException(status_code=400, detail="Invalid reset code")
    
    user.password = pwd_context.hash(data.new_password)
    user.reset_code = None
    user.reset_code_expires = None
    db.commit()
    return {"status": "ok", "message": "Password has been reset successfully"}

@router.post("/change-password")
async def change_password(data: ChangePasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.Users).filter(models.Users.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Profil nicht gefunden")
    if not pwd_context.verify(data.current_password, user.password):
        raise HTTPException(status_code=400, detail="Aktuelles Passwort ist falsch")
    if data.current_password == data.new_password:
        raise HTTPException(status_code=400, detail="Neues Passwort darf nicht dem alten entsprechen")
    
    try:
        user.password = pwd_context.hash(data.new_password)
        db.commit()
        return {"status": "ok", "message": "Passwort wurde erfolgreich geändert"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error changing password: {str(e)}")
