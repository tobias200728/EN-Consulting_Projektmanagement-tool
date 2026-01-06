"""User Management Routes"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import SessionLocal
import models
from utils.security import pwd_context

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
    """
    Admin-Endpoint: Zeigt alle User im System an
    Nur für Admins zugänglich
    """
    # Prüfe ob der anfragende User ein Admin ist
    admin_user = db.query(models.Users).filter(models.Users.id == admin_user_id).first()
    if not admin_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not admin_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can view all users")
    
    try:
        users = db.query(models.Users).order_by(models.Users.id).all()
        
        users_list = []
        for user in users:
            users_list.append({
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
                "twofa_enabled": user.twofa_enabled
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
    return {
        "id": result.id,
        "email": result.email,
        "first_name": result.first_name,
        "last_name": result.last_name,
        "role": result.role,
        "twofa_enabled": result.twofa_enabled
    }

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