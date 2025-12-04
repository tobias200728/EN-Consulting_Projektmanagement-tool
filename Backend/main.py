from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Annotated, Optional
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


app = FastAPI()


origins = [
    "http://localhost:8081",  # React Native Expo
    "http://127.0.0.1:8081",
    
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # oder ["*"] während Dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


models.Base.metadata.create_all(bind=engine)

#pw hashen
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


#2FA 
#(TOTP - Time Based One Time Password)
def generate_2fa_secret() -> str:
    #erstellt neues TOTP-Secret für Microsoft Authenticator handy app
    return pyotp.random_base32()

def build_otpauth_url(secret: str, username: str, issuer: str = "ENConsultingApp") -> str:
    # Baut otpauth:// URL, die Microsoft Authenticator verstehen sollte
    # Beispiel:
    # otpauth://totp/ENConsultingApp:tobi?secret=ABC&issuer=ENConsultingApp&digits=6
    label = f"{issuer}:{username}"
    return (
        f"otpauth://totp/{quote(label)}"
        f"?secret={secret}&issuer={quote(issuer)}&digits=6"
    )


class UserData(BaseModel):
    isadmin: bool = False
    username: str
    password: str
    

class Rooms(BaseModel):
    roomname: str
    room_id: int


class TwoFASetupRequest(BaseModel):
    username: str


class TwoFASetupResponse(BaseModel):
    otpauth_url: str


class TwoFAVerifyRequest(BaseModel):
    username: str
    code: str


class TwoFALoginRequest(BaseModel):
    username: str
    code: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()





@app.post("/adduser/")
async def create_user(userdata: UserData,  db: Session = Depends(get_db)):
    try:
        # Prüfen, ob der Benutzername schon existiert
        existing_user = db.query(models.Users).filter(models.Users.username == userdata.username).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")
        
        # Passwort hashen
        hashed_password = pwd_context.hash(userdata.password)
        
        # User erstellen
        db_user = models.Users(
            username=userdata.username,
            password=hashed_password,
            isadmin=userdata.isadmin
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return {"id": db_user.id, "username": db_user.username, "isadmin": db_user.isadmin}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/getuserbyID/{user_id}")
async def get_user_by_id(user_id : int, db: Session = Depends(get_db)):
    result = db.query(models.Users).filter(models.Users.id == user_id).all()
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return result



#new
@app.post("/login")
async def login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.query(models.Users).filter(models.Users.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not pwd_context.verify(password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    if user.twofa_enabled:
        return {
            "status": "2fa_required",
            "username": user.username,
            "user_id": user.id,
            "isadmin": user.isadmin,
        }
    else:
        return {
            "status": "ok",
            "message": "Login successful (no 2FA enabled)",
            "user_id": user.id,
            "isadmin": user.isadmin,
        }


@app.post("/login/2fa")
async def login_2fa(data: TwoFALoginRequest, db: Session = Depends(get_db)):
    # Dann weiter mit Login Schritt 2: 2FA-Code prüfen
    # Wird nur verwendet, wenn zuvor /login status=2fa_required geliefert hat
    user = (
        db.query(models.Users)
        .filter(models.Users.username == data.username)
        .first()
    )

    if not user or not user.twofa_enabled or not user.twofa_secret:
        raise HTTPException(
            status_code=400, detail="2FA not enabled for this user"
        )

    totp = pyotp.TOTP(user.twofa_secret)
    if not totp.verify(data.code):
        raise HTTPException(status_code=401, detail="Invalid 2FA code")

    # Hier könnte später ein JWT erzeugt werden JWT = (Justiz Wartungs terminal)
    return {
        "status": "ok",
        "message": "Login with 2FA successful",
        "user_id": user.id,
        "isadmin": user.isadmin,
    }

@app.post("/2fa/setup", response_model=TwoFASetupResponse)
async def setup_2fa(data: TwoFASetupRequest, db: Session = Depends(get_db)):
    # da startest du das 2FA-Setup:
    # - generiert ein neues Secret
    # - speichert es beim User
    # - gibt eine otpauth-URL zurück (für Microsoft Authenticator)
    user = (
        db.query(models.Users)
        .filter(models.Users.username == data.username)
        .first()
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Neues Secret erzeugen
    secret = generate_2fa_secret()
    user.twofa_secret = secret
    user.twofa_enabled = True  # setzt Datenbank Value auf true um 2FA pop up fenster zu öffnen
    db.commit()

    otpauth_url = build_otpauth_url(secret, user.username, issuer="ENConsultingApp")

    return TwoFASetupResponse(otpauth_url=otpauth_url)

@app.post("/2fa/verify-setup")
async def verify_2fa_setup(data: TwoFAVerifyRequest, db: Session = Depends(get_db)):
    # da das 2FA-Setup bestätigen:
    # - User gibt den Code aus der App ein
    # - wenn passt → twofa_enabled = True - sonst shit happens
    user = (
        db.query(models.Users)
        .filter(models.Users.username == data.username)
        .first()
    )
    if not user or not user.twofa_secret:
        raise HTTPException(
            status_code=404,
            detail="User not found or 2FA not initialized",
        )

    totp = pyotp.TOTP(user.twofa_secret)
    if not totp.verify(data.code):
        raise HTTPException(status_code=400, detail="Invalid 2FA code")

    user.twofa_enabled = True
    db.commit()

    return {"status": "ok", "message": "2FA successfully enabled"}


@app.get("/2fa/qr/{username}")
async def get_2fa_qr(username: str, db: Session = Depends(get_db)):
    user = db.query(models.Users).filter(models.Users.username == username).first()
    if not user or not user.twofa_secret:
        raise HTTPException(status_code=404, detail="User not found or 2FA not initialized")

    # otpauth URL erstellen
    otpauth_url = f"otpauth://totp/ENConsultingApp:{user.username}?secret={user.twofa_secret}&issuer=ENConsultingApp&digits=6"

    # QR Code generieren
    img = qrcode.make(otpauth_url)
    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return StreamingResponse(buf, media_type="image/png")