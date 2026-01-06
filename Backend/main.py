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
from datetime import datetime
import Rbac


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


# ==================== PYDANTIC MODELS ====================

# User Models
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


# Project Models
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "planning"
    progress: float = 0.0
    due_date: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[float] = None
    due_date: Optional[str] = None


class ProjectMemberAdd(BaseModel):
    user_id: int


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==================== HELPER FUNCTIONS (Projects) ====================

def get_user(user_id: int, db: Session):
    """Holt User aus DB"""
    user = db.query(models.Users).filter(models.Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def format_project_response(project, db: Session):
    """Formatiert Project für Response"""
    # Creator Info
    creator = db.query(models.Users).filter(models.Users.id == project.created_by).first()
    
    # Member Count
    member_count = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project.id
    ).count()
    
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "status": project.status,
        "progress": project.progress,
        "due_date": str(project.due_date) if project.due_date else None,
        "created_by": project.created_by,
        "creator_email": creator.email if creator else None,
        "creator_name": f"{creator.first_name or ''} {creator.last_name or ''}".strip() if creator else None,
        "member_count": member_count
    }


# ==================== FASTAPI APP ====================

app = FastAPI(
    title="EN-Consulting API",
    description="Project Management Tool API",
    version="1.0.0",
    openapi_tags=[
        {
            "name": "User Management",
        },
        {
            "name": "Authentication",
        },
        {
            "name": "Two-Factor Authentication",
        },
        {
            "name": "Password Management",
        },
        {
            "name": "Projects",
        },
        {
            "name": "Project Members",
        },
    ]
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


models.Base.metadata.create_all(bind=engine)


# ==================== USER MANAGEMENT ====================

@app.post("/adduser/", tags=["User Management"])
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


@app.get("/getuserbyID/{user_id}", tags=["User Management"])
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
        "is_active": result.is_active
    }


@app.delete("/deleteuser/{user_id}", tags=["User Management"])
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


# ==================== LOGIN ====================

@app.post("/login", tags=["Authentication"])
async def login(
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.query(models.Users).filter(models.Users.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not pwd_context.verify(password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    
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


@app.post("/login/2fa", tags=["Authentication"])
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

@app.post("/2fa/setup", response_model=TwoFASetupResponse, tags=["Two-Factor Authentication"])
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


@app.get("/2fa/qr/{email}", tags=["Two-Factor Authentication"])
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


@app.get("/2fa/status/{email}", tags=["Two-Factor Authentication"])
async def check_2fa_status(email: str, db: Session = Depends(get_db)):
    user = db.query(models.Users).filter(models.Users.email == email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    is_2fa_active = user.twofa_secret is not None and user.twofa_secret != ""
    
    return {
        "status": "ok",
        "email": user.email,
        "twofa_enabled": is_2fa_active
    }


# ==================== PASSWORD RESET ====================

@app.post("/forgot-password", tags=["Password Management"])
async def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.Users).filter(models.Users.email == data.email).first()
    
    if not user:
        return {
            "status": "ok",
            "message": "If this email exists, a reset code has been sent"
        }
    
    reset_code = generate_reset_code()
    user.reset_code = reset_code
    user.reset_code_expires = int(time.time()) + 900
    db.commit()
    
    email_sent = send_password_reset_email(user.email, reset_code)
    
    return {
        "status": "ok",
        "message": "Reset code has been sent"
    }


@app.post("/verify-reset-code", tags=["Password Management"])
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
    
    return {
        "status": "ok",
        "message": "Code verified successfully"
    }


@app.post("/reset-password", tags=["Password Management"])
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
    
    return {
        "status": "ok",
        "message": "Password has been reset successfully"
    }


@app.post("/change-password", tags=["Password Management"])
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
        
        return {
            "status": "ok",
            "message": "Passwort wurde erfolgreich geändert"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error changing password: {str(e)}")


# ==================== PROJECTS ====================

@app.post("/projects", tags=["Projects"])
async def create_project(data: ProjectCreate, user_id: int, db: Session = Depends(get_db)):
    """
    Erstellt ein neues Projekt
    - Nur ADMIN kann Projekte erstellen
    - Parameter: user_id als Query Parameter
    """
    user = get_user(user_id, db)
    
    if not Rbac.can_create_project(user):
        raise HTTPException(status_code=403, detail="Only admins can create projects")
    
    try:
        due_date_obj = None
        if data.due_date:
            due_date_obj = datetime.strptime(data.due_date, "%Y-%m-%d").date()
        
        db_project = models.Project(
            name=data.name,
            description=data.description,
            status=data.status,
            progress=data.progress,
            due_date=due_date_obj,
            created_by=user_id
        )
        
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        
        return {
            "status": "ok",
            "message": "Project created successfully",
            "project": format_project_response(db_project, db)
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating project: {str(e)}")


@app.get("/projects", tags=["Projects"])
async def get_projects(user_id: int, db: Session = Depends(get_db)):
    """
    Holt alle Projekte für einen User
    - Admin: Sieht alle Projekte
    - Employee/Guest: Sieht nur zugewiesene Projekte
    - Parameter: user_id als Query Parameter
    """
    user = get_user(user_id, db)
    
    try:
        if user.is_admin:
            projects = db.query(models.Project).order_by(
                models.Project.id.desc()
            ).all()
        else:
            projects = db.query(models.Project).join(
                models.ProjectMember,
                models.Project.id == models.ProjectMember.project_id
            ).filter(
                models.ProjectMember.user_id == user_id
            ).order_by(
                models.Project.id.desc()
            ).all()
        
        projects_formatted = [format_project_response(p, db) for p in projects]
        
        return {
            "status": "ok",
            "projects": projects_formatted,
            "total": len(projects_formatted)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching projects: {str(e)}")


@app.get("/projects/{project_id}", tags=["Projects"])
async def get_project_by_id(project_id: int, user_id: int, db: Session = Depends(get_db)):
    """
    Holt ein einzelnes Projekt
    - User muss Zugriff auf das Projekt haben
    - Parameter: project_id als Path, user_id als Query Parameter
    """
    user = get_user(user_id, db)
    
    project = db.query(models.Project).filter(
        models.Project.id == project_id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not Rbac.can_view_project(db, user, project_id):
        raise HTTPException(status_code=403, detail="You don't have access to this project")
    
    return {
        "status": "ok",
        "project": format_project_response(project, db)
    }


@app.put("/projects/{project_id}", tags=["Projects"])
async def update_project(project_id: int, data: ProjectUpdate, user_id: int, db: Session = Depends(get_db)):
    """
    Updated ein Projekt
    - Nur ADMIN kann Projekte bearbeiten
    - Parameter: project_id als Path, user_id als Query Parameter
    """
    user = get_user(user_id, db)
    
    project = db.query(models.Project).filter(
        models.Project.id == project_id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not Rbac.can_edit_project(db, user, project_id):
        raise HTTPException(status_code=403, detail="Only admins can edit projects")
    
    try:
        if data.name is not None:
            project.name = data.name
        if data.description is not None:
            project.description = data.description
        if data.status is not None:
            project.status = data.status
        if data.progress is not None:
            project.progress = data.progress
        if data.due_date is not None:
            project.due_date = datetime.strptime(data.due_date, "%Y-%m-%d").date()
        
        db.commit()
        db.refresh(project)
        
        return {
            "status": "ok",
            "message": "Project updated successfully",
            "project": format_project_response(project, db)
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating project: {str(e)}")


@app.delete("/projects/{project_id}", tags=["Projects"])
async def delete_project(project_id: int, user_id: int, db: Session = Depends(get_db)):
    """
    Löscht ein Projekt
    - Nur ADMIN kann Projekte löschen
    - Parameter: project_id als Path, user_id als Query Parameter
    """
    user = get_user(user_id, db)
    
    project = db.query(models.Project).filter(
        models.Project.id == project_id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not Rbac.can_delete_project(user):
        raise HTTPException(status_code=403, detail="Only admins can delete projects")
    
    try:
        project_name = project.name
        
        db.query(models.ProjectMember).filter(
            models.ProjectMember.project_id == project_id
        ).delete()
        
        db.delete(project)
        db.commit()
        
        return {
            "status": "ok",
            "message": f"Project '{project_name}' successfully deleted",
            "project_id": project_id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting project: {str(e)}")


# ==================== PROJECT MEMBERS ====================

@app.post("/projects/{project_id}/members", tags=["Project Members"])
async def add_project_member(project_id: int, data: ProjectMemberAdd, user_id: int, db: Session = Depends(get_db)):
    """
    Fügt einen User zu einem Projekt hinzu
    - Nur ADMIN kann Members hinzufügen
    - Parameter: project_id als Path, user_id (admin) als Query Parameter
    """
    admin_user = get_user(user_id, db)
    
    if not Rbac.can_manage_project_members(admin_user):
        raise HTTPException(status_code=403, detail="Only admins can manage project members")
    
    project = db.query(models.Project).filter(
        models.Project.id == project_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    target_user = db.query(models.Users).filter(
        models.Users.id == data.user_id
    ).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    existing = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == data.user_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member of this project")
    
    try:
        new_member = models.ProjectMember(
            project_id=project_id,
            user_id=data.user_id
        )
        
        db.add(new_member)
        db.commit()
        db.refresh(new_member)
        
        return {
            "status": "ok",
            "message": "Member added to project successfully",
            "member": {
                "id": new_member.id,
                "project_id": new_member.project_id,
                "user_id": new_member.user_id,
                "user_email": target_user.email,
                "user_name": f"{target_user.first_name or ''} {target_user.last_name or ''}".strip() or None
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error adding member: {str(e)}")


@app.delete("/projects/{project_id}/members/{member_user_id}", tags=["Project Members"])
async def remove_project_member(project_id: int, member_user_id: int, user_id: int, db: Session = Depends(get_db)):
    """
    Entfernt einen User aus einem Projekt
    - Nur ADMIN kann Members entfernen
    - Parameter: project_id, member_user_id als Path, user_id (admin) als Query Parameter
    """
    admin_user = get_user(user_id, db)
    
    if not Rbac.can_manage_project_members(admin_user):
        raise HTTPException(status_code=403, detail="Only admins can manage project members")
    
    member = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == member_user_id
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Member not found in this project")
    
    try:
        db.delete(member)
        db.commit()
        
        return {
            "status": "ok",
            "message": "Member removed from project successfully",
            "project_id": project_id,
            "user_id": member_user_id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error removing member: {str(e)}")


@app.get("/projects/{project_id}/members", tags=["Project Members"])
async def get_project_members(project_id: int, user_id: int, db: Session = Depends(get_db)):
    """
    Holt alle Mitglieder eines Projekts
    - User muss Zugriff auf das Projekt haben
    - Parameter: project_id als Path, user_id als Query Parameter
    """
    user = get_user(user_id, db)
    
    project = db.query(models.Project).filter(
        models.Project.id == project_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not Rbac.can_view_project(db, user, project_id):
        raise HTTPException(status_code=403, detail="You don't have access to this project")
    
    members = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id
    ).all()
    
    members_list = []
    for member in members:
        member_user = db.query(models.Users).filter(
            models.Users.id == member.user_id
        ).first()
        
        members_list.append({
            "id": member.id,
            "project_id": member.project_id,
            "user_id": member.user_id,
            "user_email": member_user.email if member_user else None,
            "user_name": f"{member_user.first_name or ''} {member_user.last_name or ''}".strip() if member_user else None
        })
    
    return {
        "status": "ok",
        "members": members_list,
        "total": len(members_list)
    }