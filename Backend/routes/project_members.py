"""Project Members Routes"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import SessionLocal
import models
import Rbac
from utils.helpers import get_user

router = APIRouter(tags=["Project Members"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ProjectMemberAdd(BaseModel):
    user_id: int

@router.post("/projects/{project_id}/members")
async def add_project_member(project_id: int, data: ProjectMemberAdd, user_id: int, db: Session = Depends(get_db)):
    admin_user = get_user(user_id, db)
    if not Rbac.can_manage_project_members(admin_user):
        raise HTTPException(status_code=403, detail="Only admins can manage project members")
    
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    target_user = db.query(models.Users).filter(models.Users.id == data.user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    existing = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == data.user_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member of this project")
    
    try:
        new_member = models.ProjectMember(project_id=project_id, user_id=data.user_id)
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

@router.delete("/projects/{project_id}/members/{member_user_id}")
async def remove_project_member(project_id: int, member_user_id: int, user_id: int, db: Session = Depends(get_db)):
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

@router.get("/projects/{project_id}/members")
async def get_project_members(project_id: int, user_id: int, db: Session = Depends(get_db)):
    user = get_user(user_id, db)
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not Rbac.can_view_project(db, user, project_id):
        raise HTTPException(status_code=403, detail="You don't have access to this project")
    
    members = db.query(models.ProjectMember).filter(models.ProjectMember.project_id == project_id).all()
    members_list = []
    for member in members:
        member_user = db.query(models.Users).filter(models.Users.id == member.user_id).first()
        members_list.append({
            "id": member.id,
            "project_id": member.project_id,
            "user_id": member.user_id,
            "user_email": member_user.email if member_user else None,
            "user_name": f"{member_user.first_name or ''} {member_user.last_name or ''}".strip() if member_user else None
        })
    
    return {"status": "ok", "members": members_list, "total": len(members_list)}
