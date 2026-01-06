"""User TODOs Routes"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
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
    }

@router.post("/users/{user_id}/todos")
async def create_user_todo(user_id: int, data: UserTodoCreate, db: Session = Depends(get_db)):
    """
    Erstellt ein neues TODO für den angegebenen User
    """
    # Prüfe ob User existiert
    user = get_user(user_id, db)
    
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
async def get_user_todos(user_id: int, db: Session = Depends(get_db)):
    """
    Gibt alle TODOs eines Users zurück
    """
    # Prüfe ob User existiert
    user = get_user(user_id, db)
    
    todos = db.query(models.UserTodo).filter(
        models.UserTodo.user_id == user_id
    ).all()
    
    todos_formatted = [format_user_todo_response(t) for t in todos]
    return {"status": "ok", "todos": todos_formatted, "total": len(todos_formatted)}

@router.get("/users/{user_id}/todos/by-date/{date}")
async def get_user_todos_by_date(user_id: int, date: str, db: Session = Depends(get_db)):
    """
    Gibt alle TODOs eines Users für ein bestimmtes Datum zurück
    
    Parameters:
    - user_id: ID des Users
    - date: Datum im Format YYYY-MM-DD (z.B. 2026-01-07)
    
    Returns:
    - Liste von TODOs für das angegebene Datum
    """
    # Prüfe ob User existiert
    user = get_user(user_id, db)
    
    try:
        # Parse das Datum
        date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        
        # Hole alle TODOs für dieses Datum
        todos = db.query(models.UserTodo).filter(
            models.UserTodo.user_id == user_id,
            models.UserTodo.due_date == date_obj
        ).all()
        
        todos_formatted = [format_user_todo_response(t) for t in todos]
        
        return {
            "status": "ok",
            "date": date,
            "todos": todos_formatted,
            "total": len(todos_formatted)
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching todos: {str(e)}")

@router.get("/users/{user_id}/todos/{todo_id}")
async def get_user_todo(user_id: int, todo_id: int, db: Session = Depends(get_db)):
    """
    Gibt ein spezifisches TODO zurück
    """
    # Prüfe ob User existiert
    user = get_user(user_id, db)
    
    todo = db.query(models.UserTodo).filter(
        models.UserTodo.id == todo_id,
        models.UserTodo.user_id == user_id
    ).first()
    
    if not todo:
        raise HTTPException(status_code=404, detail="TODO not found")
    
    return {"status": "ok", "todo": format_user_todo_response(todo)}

@router.put("/users/{user_id}/todos/{todo_id}")
async def update_user_todo(user_id: int, todo_id: int, data: UserTodoUpdate, db: Session = Depends(get_db)):
    """
    Aktualisiert ein TODO
    """
    # Prüfe ob User existiert
    user = get_user(user_id, db)
    
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
async def delete_user_todo(user_id: int, todo_id: int, db: Session = Depends(get_db)):
    """
    Löscht ein TODO
    """
    # Prüfe ob User existiert
    user = get_user(user_id, db)
    
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