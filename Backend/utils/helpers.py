"""Helper Functions"""
from fastapi import HTTPException
from sqlalchemy.orm import Session
import models

def get_user(user_id: int, db: Session):
    """Holt User aus DB"""
    user = db.query(models.Users).filter(models.Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def format_project_response(project, db: Session):
    """Formatiert Project für Response"""
    creator = db.query(models.Users).filter(models.Users.id == project.created_by).first()
    member_count = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project.id
    ).count()
    
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "status": project.status,
        "progress": project.progress,
        "start_date": str(project.start_date) if project.start_date else None,
        "end_date": str(project.end_date) if project.end_date else None,
        "interim_dates": [str(date) for date in project.interim_dates] if project.interim_dates else [],
        "created_by": project.created_by,
        "creator_email": creator.email if creator else None,
        "creator_name": f"{creator.first_name or ''} {creator.last_name or ''}".strip() if creator else None,
        "member_count": member_count
    }