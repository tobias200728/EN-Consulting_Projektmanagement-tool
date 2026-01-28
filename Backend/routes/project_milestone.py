"""Project Milestones Routes"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from database import SessionLocal
import models
import Rbac
from utils.helpers import get_user

router = APIRouter(tags=["Project Milestones"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class MilestoneCreate(BaseModel):
    title: str
    milestone_date: str  # YYYY-MM-DD
    description: Optional[str] = None

class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    milestone_date: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

@router.post("/projects/{project_id}/milestones")
async def create_milestone(
    project_id: int, 
    data: MilestoneCreate, 
    user_id: int, 
    db: Session = Depends(get_db)
):
    """Erstellt einen neuen Meilenstein für ein Projekt"""
    user = get_user(user_id, db)
    
    # Nur Admins können Milestones erstellen
    if not Rbac.can_edit_project(db, user, project_id):
        raise HTTPException(
            status_code=403, 
            detail="Only admins can create milestones"
        )
    
    project = db.query(models.Project).filter(
        models.Project.id == project_id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    try:
        milestone_date_obj = datetime.strptime(data.milestone_date, "%Y-%m-%d").date()
        
        db_milestone = models.ProjectMilestone(
            project_id=project_id,
            title=data.title,
            milestone_date=milestone_date_obj,
            description=data.description,
            created_by=user_id
        )
        
        db.add(db_milestone)
        db.commit()
        db.refresh(db_milestone)
        
        return {
            "status": "ok",
            "message": "Milestone created successfully",
            "milestone": format_milestone_response(db_milestone)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"Error creating milestone: {str(e)}"
        )

@router.get("/projects/{project_id}/milestones")
async def get_project_milestones(
    project_id: int, 
    user_id: int, 
    db: Session = Depends(get_db)
):
    """Gibt alle Meilensteine eines Projekts zurück"""
    user = get_user(user_id, db)
    
    if not Rbac.can_view_project(db, user, project_id):
        raise HTTPException(
            status_code=403,
            detail="You don't have access to this project"
        )
    
    milestones = db.query(models.ProjectMilestone).filter(
        models.ProjectMilestone.project_id == project_id
    ).order_by(models.ProjectMilestone.milestone_date).all()
    
    milestones_list = [format_milestone_response(m) for m in milestones]
    
    return {
        "status": "ok",
        "milestones": milestones_list,
        "total": len(milestones_list)
    }

@router.put("/projects/{project_id}/milestones/{milestone_id}")
async def update_milestone(
    project_id: int,
    milestone_id: int,
    data: MilestoneUpdate,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Aktualisiert einen Meilenstein"""
    user = get_user(user_id, db)
    
    if not Rbac.can_edit_project(db, user, project_id):
        raise HTTPException(
            status_code=403,
            detail="Only admins can edit milestones"
        )
    
    milestone = db.query(models.ProjectMilestone).filter(
        models.ProjectMilestone.id == milestone_id,
        models.ProjectMilestone.project_id == project_id
    ).first()
    
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    try:
        if data.title is not None:
            milestone.title = data.title
        if data.milestone_date is not None:
            milestone.milestone_date = datetime.strptime(data.milestone_date, "%Y-%m-%d").date()
        if data.description is not None:
            milestone.description = data.description
        if data.status is not None:
            milestone.status = data.status
        
        db.commit()
        db.refresh(milestone)
        
        return {
            "status": "ok",
            "message": "Milestone updated successfully",
            "milestone": format_milestone_response(milestone)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error updating milestone: {str(e)}"
        )

@router.delete("/projects/{project_id}/milestones/{milestone_id}")
async def delete_milestone(
    project_id: int,
    milestone_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Löscht einen Meilenstein"""
    user = get_user(user_id, db)
    
    if not Rbac.can_delete_project(user):
        raise HTTPException(
            status_code=403,
            detail="Only admins can delete milestones"
        )
    
    milestone = db.query(models.ProjectMilestone).filter(
        models.ProjectMilestone.id == milestone_id,
        models.ProjectMilestone.project_id == project_id
    ).first()
    
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    try:
        db.delete(milestone)
        db.commit()
        
        return {
            "status": "ok",
            "message": "Milestone deleted successfully"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting milestone: {str(e)}"
        )

def format_milestone_response(milestone):
    """Formatiert Milestone für Response"""
    return {
        "id": milestone.id,
        "project_id": milestone.project_id,
        "title": milestone.title,
        "milestone_date": str(milestone.milestone_date) if milestone.milestone_date else None,
        "description": milestone.description,
        "status": milestone.status,
        "created_by": milestone.created_by,
        "created_at": milestone.created_at.isoformat() if milestone.created_at else None
    }