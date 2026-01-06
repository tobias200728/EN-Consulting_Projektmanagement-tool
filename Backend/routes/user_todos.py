"""User TODOs Routes"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from database import SessionLocal
import models
from utils.helpers import get_user

router = APIRouter(tags=["User TODOs"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UserTodoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "todo"
    priority: str = "medium"
    due_date: Optional[str] = None

class UserTodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None

def format_user_todo_response(todo):
    return {
        "id": todo.id,
        "user_id": todo.user_id,
        "title": todo.title,
        "description": todo.description,
        "status": todo.status,
        "priority": todo.priority,
        "due_date": str(todo.due_date) if todo.due_date else None,
        "created_at": todo.created_at.isoformat() if todo.created_at else None,
        "updated_at": todo.updated_at.isoformat() if todo.updated_at else None
    }

@router.post("/users/{user_id}/todos")
async def create_user_todo(user_id: int, data: UserTodoCreate, requesting_user_id: int, db: Session = Depends(get_db)):
    requesting_user = get_user(requesting_user_id, db)
    
    # User kann nur eigene TODOs erstellen, außer Admin
    if user_id != requesting_user_id and not requesting_user.is_admin:
        raise HTTPException(status_code=403, detail="You can only create TODOs for yourself")
    
    # Prüfe ob target user existiert
    target_user = get_user(user_id, db)
    
    try:
        due_date_obj = None
        if data.due_date:
            due_date_obj = datetime.strptime(data.due_date, "%Y-%m-%d").date()
        
        db_todo = models.UserTodo(
            user_id=user_id,
            title=data.title,
            description=data.description,
            status=data.status,
            priority=data.priority,
            due_date=due_date_obj
        )
        db.add(db_todo)
        db.commit()
        db.refresh(db_todo)
        
        return {
            "status": "ok",
            "message": "TODO created successfully",
            "todo": format_user_todo_response(db_todo)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating TODO: {str(e)}")

@router.get("/users/{user_id}/todos")
async def get_user_todos(user_id: int, requesting_user_id: int, db: Session = Depends(get_db)):
    requesting_user = get_user(requesting_user_id, db)
    
    # User kann nur eigene TODOs sehen, außer Admin
    if user_id != requesting_user_id and not requesting_user.is_admin:
        raise HTTPException(status_code=403, detail="You can only view your own TODOs")
    
    todos = db.query(models.UserTodo).filter(
        models.UserTodo.user_id == user_id
    ).order_by(models.UserTodo.created_at.desc()).all()
    
    todos_formatted = [format_user_todo_response(t) for t in todos]
    return {"status": "ok", "todos": todos_formatted, "total": len(todos_formatted)}

@router.get("/users/{user_id}/todos/{todo_id}")
async def get_user_todo(user_id: int, todo_id: int, requesting_user_id: int, db: Session = Depends(get_db)):
    requesting_user = get_user(requesting_user_id, db)
    
    if user_id != requesting_user_id and not requesting_user.is_admin:
        raise HTTPException(status_code=403, detail="You can only view your own TODOs")
    
    todo = db.query(models.UserTodo).filter(
        models.UserTodo.id == todo_id,
        models.UserTodo.user_id == user_id
    ).first()
    
    if not todo:
        raise HTTPException(status_code=404, detail="TODO not found")
    
    return {"status": "ok", "todo": format_user_todo_response(todo)}

@router.put("/users/{user_id}/todos/{todo_id}")
async def update_user_todo(user_id: int, todo_id: int, data: UserTodoUpdate, requesting_user_id: int, db: Session = Depends(get_db)):
    requesting_user = get_user(requesting_user_id, db)
    
    if user_id != requesting_user_id and not requesting_user.is_admin:
        raise HTTPException(status_code=403, detail="You can only update your own TODOs")
    
    todo = db.query(models.UserTodo).filter(
        models.UserTodo.id == todo_id,
        models.UserTodo.user_id == user_id
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
        if data.due_date is not None:
            todo.due_date = datetime.strptime(data.due_date, "%Y-%m-%d").date()
        
        todo.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(todo)
        
        return {
            "status": "ok",
            "message": "TODO updated successfully",
            "todo": format_user_todo_response(todo)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating TODO: {str(e)}")

@router.delete("/users/{user_id}/todos/{todo_id}")
async def delete_user_todo(user_id: int, todo_id: int, requesting_user_id: int, db: Session = Depends(get_db)):
    requesting_user = get_user(requesting_user_id, db)
    
    if user_id != requesting_user_id and not requesting_user.is_admin:
        raise HTTPException(status_code=403, detail="You can only delete your own TODOs")
    
    todo = db.query(models.UserTodo).filter(
        models.UserTodo.id == todo_id,
        models.UserTodo.user_id == user_id
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
