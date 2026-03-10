"""User Management Routes"""
from fastapi import APIRouter, HTTPException, Depends, File, UploadFile
from fastapi.responses import Response
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from database import SessionLocal
import models
from utils.security import pwd_context
import base64

router = APIRouter(tags=["User Management"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UserData(BaseModel):
    email: EmailStr
    password: str
    role: str = "employee"

class UpdateUserRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None

@router.post("/adduser/")
async def create_user(userdata: UserData, db: Session = Depends(get_db)):
    try:
        existing_user = db.query(models.Users).filter(models.Users.email == userdata.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already exists")
        
        hashed_password = pwd_context.hash(userdata.password)
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

@router.get("/users")
async def get_all_users(admin_user_id: int, db: Session = Depends(get_db)):
    admin_user = db.query(models.Users).filter(models.Users.id == admin_user_id).first()
    if not admin_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not admin_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can view all users")
    
    try:
        users = db.query(models.Users).order_by(models.Users.id).all()
        
        users_list = []
        for user in users:
            # Prüfe ob Profilbild in profile_pictures Tabelle existiert
            has_picture = db.query(models.ProfilePicture).filter(
                models.ProfilePicture.user_id == user.id
            ).first() is not None

            users_list.append({
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
                "twofa_enabled": user.twofa_enabled,
                "has_profile_picture": has_picture
            })
        
        return {
            "status": "ok",
            "users": users_list,
            "total": len(users_list)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")

@router.get("/getuserbyID/{user_id}")
async def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    result = db.query(models.Users).filter(models.Users.id == user_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Lade Profilbild aus profile_pictures Tabelle
    profile_picture_base64 = None
    picture = db.query(models.ProfilePicture).filter(
        models.ProfilePicture.user_id == user_id
    ).first()
    if picture:
        profile_picture_base64 = base64.b64encode(picture.image_data).decode('utf-8')
    
    return {
        "id": result.id,
        "email": result.email,
        "first_name": result.first_name,
        "last_name": result.last_name,
        "role": result.role,
        "twofa_enabled": result.twofa_enabled,
        "profile_picture": profile_picture_base64
    }

@router.put("/update-user/{user_id}")
async def update_user(user_id: int, request: UpdateUserRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(models.Users).filter(models.Users.id == user_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User nicht gefunden")
        
        if request.first_name is not None:
            user.first_name = request.first_name
        if request.last_name is not None:
            user.last_name = request.last_name
        
        db.commit()
        db.refresh(user)
        
        return {
            "status": "ok",
            "message": "User erfolgreich aktualisiert",
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "role": user.role
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Aktualisieren: {str(e)}")

@router.post("/upload-profile-picture/{user_id}")
async def upload_profile_picture(
    user_id: int, 
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        user = db.query(models.Users).filter(models.Users.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User nicht gefunden")
        
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Ungültiger Dateityp. Erlaubt: JPG, PNG, GIF, WEBP")
        
        contents = await file.read()
        
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Datei zu groß. Maximum: 5MB")
        
        # Update oder Insert in profile_pictures Tabelle
        existing = db.query(models.ProfilePicture).filter(
            models.ProfilePicture.user_id == user_id
        ).first()
        
        if existing:
            existing.image_data = contents
            existing.content_type = file.content_type
            existing.updated_at = datetime.utcnow()
        else:
            db.add(models.ProfilePicture(
                user_id=user_id,
                image_data=contents,
                content_type=file.content_type
            ))
        
        db.commit()
        
        profile_picture_base64 = base64.b64encode(contents).decode('utf-8')
        
        return {
            "status": "ok",
            "message": "Profilbild erfolgreich hochgeladen",
            "profile_picture": profile_picture_base64,
            "file_size": len(contents),
            "file_type": file.content_type
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Hochladen: {str(e)}")

@router.get("/profile-picture/{user_id}")
async def get_profile_picture(user_id: int, db: Session = Depends(get_db)):
    try:
        picture = db.query(models.ProfilePicture).filter(
            models.ProfilePicture.user_id == user_id
        ).first()
        
        if not picture:
            raise HTTPException(status_code=404, detail="Kein Profilbild vorhanden")
        
        return Response(content=picture.image_data, media_type=picture.content_type or "image/jpeg")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Abrufen: {str(e)}")

@router.delete("/profile-picture/{user_id}")
async def delete_profile_picture(user_id: int, db: Session = Depends(get_db)):
    try:
        picture = db.query(models.ProfilePicture).filter(
            models.ProfilePicture.user_id == user_id
        ).first()
        
        if not picture:
            raise HTTPException(status_code=404, detail="Kein Profilbild vorhanden")
        
        db.delete(picture)
        db.commit()
        
        return {"status": "ok", "message": "Profilbild erfolgreich gelöscht"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Löschen: {str(e)}")

@router.delete("/deleteuser/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db)):
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