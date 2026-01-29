"""Projects Routes"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import ARRAY
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from database import SessionLocal
import models
import Rbac
from utils.helpers import get_user, format_project_response

router = APIRouter(tags=["Projects"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "planning"
    progress: float = 0.0
    start_date: date
    end_date: date
    interim_dates: List[date]

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    interim_dates: Optional[List[date]] = None

@router.post("/projects")
async def create_project(data: ProjectCreate, user_id: int, db: Session = Depends(get_db)):
    user = get_user(user_id, db)
    if not Rbac.can_create_project(user):
        raise HTTPException(status_code=403, detail="Only admins can create projects")
    
    try:
        db_project = models.Project(
            name=data.name,
            description=data.description,
            status=data.status,
            progress=data.progress,
            start_date=data.start_date,
            end_date=data.end_date,
            interim_dates=data.interim_dates,
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

@router.get("/projects")
async def get_projects(user_id: int, db: Session = Depends(get_db)):
    user = get_user(user_id, db)
    try:
        if user.is_admin:
            projects = db.query(models.Project).order_by(models.Project.id.desc()).all()
        else:
            projects = db.query(models.Project).join(
                models.ProjectMember, models.Project.id == models.ProjectMember.project_id
            ).filter(models.ProjectMember.user_id == user_id).order_by(models.Project.id.desc()).all()
        
        projects_formatted = [format_project_response(p, db) for p in projects]
        return {"status": "ok", "projects": projects_formatted, "total": len(projects_formatted)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching projects: {str(e)}")

@router.get("/projects/{project_id}")
async def get_project_by_id(project_id: int, user_id: int, db: Session = Depends(get_db)):
    user = get_user(user_id, db)
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not Rbac.can_view_project(db, user, project_id):
        raise HTTPException(status_code=403, detail="You don't have access to this project")
    return {"status": "ok", "project": format_project_response(project, db)}

@router.put("/projects/{project_id}")
async def update_project(project_id: int, data: ProjectUpdate, user_id: int, db: Session = Depends(get_db)):
    user = get_user(user_id, db)
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
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
        if data.start_date is not None:
            project.start_date = data.start_date
        if data.end_date is not None:
            project.end_date = data.end_date
        if data.interim_dates is not None:
            project.interim_dates = data.interim_dates
        
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

@router.delete("/projects/{project_id}")
async def delete_project(project_id: int, user_id: int, db: Session = Depends(get_db)):
    user = get_user(user_id, db)
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not Rbac.can_delete_project(user):
        raise HTTPException(status_code=403, detail="Only admins can delete projects")
    
    try:
        project_name = project.name
        db.query(models.ProjectMember).filter(models.ProjectMember.project_id == project_id).delete()
        db.query(models.ProjectTodo).filter(models.ProjectTodo.project_id == project_id).delete()
        db.query(models.ProjectMilestone).filter(models.ProjectMilestone.project_id == project_id).delete()
        
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
    