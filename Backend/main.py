from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Annotated
import models
from database import engine, SessionLocal, Base
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware

#uiii
app = FastAPI()
models.Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserData(BaseModel):
    isadmin: bool = False
    username: str
    password: str
    

class Rooms(BaseModel):
    roomname: str
    room_id: int


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()





@app.post("/adduser")
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



@app.post("/login")
async def login(username: str, password: str, db: Session = Depends(get_db)):
    # 1. Benutzer suchen
    user = db.query(models.Users).filter(models.Users.username == username).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Passwort prüfen (wichtig!)
    if not pwd_context.verify(password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect password")

    return {"message": "Login successful", "user_id": user.id, "isadmin": user.isadmin}
