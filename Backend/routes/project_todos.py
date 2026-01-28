"""Project TODOs Routes - UPDATED mit Pflicht-Datum"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from database import SessionLocal
import models
import Rbac
from utils.helpers import get_user

router = APIRouter(tags=["Project TODOs"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ProjectTodoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "todo"
    priority: str = "medium"
    assigned_to: Optional[int] = None
    due_date: str  # ✅ NICHT MEHR OPTIONAL - Pflichtfeld!

class ProjectTodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[int] = None
    due_date: Optional[str] = None

def format_todo_response(todo, db: Session):
    assignee = None
    if todo.assigned_to:
        user = db.query(models.Users).filter(models.Users.id == todo.assigned_to).first()
        if user:
            assignee = {
                "id": user.id,
                "email": user.email,
                "name": f"{user.first_name or ''} {user.last_name or ''}".strip() or None
            }
    
    creator = db.query(models.Users).filter(models.Users.id == todo.created_by).first()
    
    return {
        "id": todo.id,
        "project_id": todo.project_id,
        "title": todo.title,
        "description": todo.description,
        "status": todo.status,
        "priority": todo.priority,
        "assigned_to": todo.assigned_to,
        "assignee": assignee,
        "created_by": todo.created_by,
        "creator_email": creator.email if creator else None,
        "due_date": str(todo.due_date) if todo.due_date else None,
    }

@router.post("/projects/{project_id}/todos")
async def create_project_todo(project_id: int, data: ProjectTodoCreate, user_id: int, db: Session = Depends(get_db)):
    user = get_user(user_id, db)
    
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not Rbac.can_view_project(db, user, project_id):
        raise HTTPException(status_code=403, detail="You don't have access to this project")
    
    # ✅ Validiere dass due_date gesetzt ist
    if not data.due_date or data.due_date.strip() == "":
        raise HTTPException(status_code=400, detail="Due date is required for project tasks")
    
    try:
        due_date_obj = datetime.strptime(data.due_date, "%Y-%m-%d").date()
        
        db_todo = models.ProjectTodo(
            project_id=project_id,
            title=data.title,
            description=data.description,
            status=data.status,
            priority=data.priority,
            assigned_to=data.assigned_to,
            created_by=user_id,
            due_date=due_date_obj
        )
        db.add(db_todo)
        db.commit()
        db.refresh(db_todo)
        
        return {
            "status": "ok",
            "message": "TODO created successfully",
            "todo": format_todo_response(db_todo, db)
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating TODO: {str(e)}")

@router.get("/projects/{project_id}/todos")
async def get_project_todos(project_id: int, user_id: int, db: Session = Depends(get_db)):
    user = get_user(user_id, db)
    
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not Rbac.can_view_project(db, user, project_id):
        raise HTTPException(status_code=403, detail="You don't have access to this project")
    
    todos = db.query(models.ProjectTodo).filter(
        models.ProjectTodo.project_id == project_id
    ).all()
    
    todos_formatted = [format_todo_response(t, db) for t in todos]
    return {"status": "ok", "todos": todos_formatted, "total": len(todos_formatted)}

@router.get("/projects/{project_id}/todos/{todo_id}")
async def get_project_todo(project_id: int, todo_id: int, user_id: int, db: Session = Depends(get_db)):
    user = get_user(user_id, db)
    
    if not Rbac.can_view_project(db, user, project_id):
        raise HTTPException(status_code=403, detail="You don't have access to this project")
    
    todo = db.query(models.ProjectTodo).filter(
        models.ProjectTodo.id == todo_id,
        models.ProjectTodo.project_id == project_id
    ).first()
    
    if not todo:
        raise HTTPException(status_code=404, detail="TODO not found")
    
    return {"status": "ok", "todo": format_todo_response(todo, db)}

@router.put("/projects/{project_id}/todos/{todo_id}")
async def update_project_todo(project_id: int, todo_id: int, data: ProjectTodoUpdate, user_id: int, db: Session = Depends(get_db)):
    user = get_user(user_id, db)
    
    if not Rbac.can_view_project(db, user, project_id):
        raise HTTPException(status_code=403, detail="You don't have access to this project")
    
    todo = db.query(models.ProjectTodo).filter(
        models.ProjectTodo.id == todo_id,
        models.ProjectTodo.project_id == project_id
    ).first()
    
    if not todo:
        raise HTTPException(status_code=404, detail="TODO not found")
    
    try:
        if data.title is not None:
            todo.title = data.title
        if data.description is not None:
            todo.description = data.description
        if data.status is not None:
            todo.status = data.status
        if data.priority is not None:
            todo.priority = data.priority
        if data.assigned_to is not None:
            todo.assigned_to = data.assigned_to
        if data.due_date is not None:
            todo.due_date = datetime.strptime(data.due_date, "%Y-%m-%d").date()
        
        db.commit()
        db.refresh(todo)
        
        return {
            "status": "ok",
            "message": "TODO updated successfully",
            "todo": format_todo_response(todo, db)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating TODO: {str(e)}")

@router.delete("/projects/{project_id}/todos/{todo_id}")
async def delete_project_todo(project_id: int, todo_id: int, user_id: int, db: Session = Depends(get_db)):
    user = get_user(user_id, db)
    
    if not Rbac.can_view_project(db, user, project_id):
        raise HTTPException(status_code=403, detail="You don't have access to this project")
    
    todo = db.query(models.ProjectTodo).filter(
        models.ProjectTodo.id == todo_id,
        models.ProjectTodo.project_id == project_id
    ).first()
    
    if not todo:
        raise HTTPException(status_code=404, detail="TODO not found")
    
    try:
        db.delete(todo)
        db.commit()
        return {
            "status": "ok",
            "message": "TODO deleted successfully",
            "todo_id": todo_id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting TODO: {str(e)}")