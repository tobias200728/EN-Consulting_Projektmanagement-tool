"""
RBAC (Role-Based Access Control) System für EN-Consulting

Vereinfachtes 3-Rollen-System:
- ADMIN: Volle Rechte
- EMPLOYEE (Mitarbeiter): Kann in zugewiesenen Projekten arbeiten
- GUEST: Nur Lesen (read-only)
"""

from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
import models
from models import UserRole


# ==================== HELPER FUNCTIONS ====================

def is_project_member(db: Session, user_id: int, project_id: int) -> bool:
    """Prüft ob ein User Mitglied eines Projekts ist"""
    return db.query(models.ProjectMember).filter(
        models.ProjectMember.user_id == user_id,
        models.ProjectMember.project_id == project_id
    ).first() is not None


def get_user_projects(db: Session, user: models.Users) -> List[models.Project]:
    """
    Gibt alle Projekte zurück, auf die ein User Zugriff hat.
    - Admin: Alle Projekte
    - Employee/Guest: Nur zugewiesene Projekte
    """
    if user.is_admin:
        return db.query(models.Project).all()
    
    return db.query(models.Project).join(
        models.ProjectMember,
        models.Project.id == models.ProjectMember.project_id
    ).filter(
        models.ProjectMember.user_id == user.id
    ).all()


# ==================== PERMISSION CHECKS ====================

def can_view_project(db: Session, user: models.Users, project_id: int) -> bool:
    """
    Kann der User dieses Projekt sehen?
    - Admin: Ja (alle Projekte)
    - Employee: Nur wenn Mitglied
    - Guest: Nur wenn Mitglied
    """
    if user.is_admin:
        return True
    return is_project_member(db, user.id, project_id)


def can_edit_project(db: Session, user: models.Users, project_id: int) -> bool:
    """
    Kann der User dieses Projekt bearbeiten?
    - Admin: Ja
    - Employee: Nein (nur Admin kann Projekte bearbeiten)
    - Guest: Nein
    """
    return user.is_admin


def can_create_project(user: models.Users) -> bool:
    """
    Kann der User Projekte erstellen?
    - Admin: Ja
    - Employee: Nein
    - Guest: Nein
    """
    return user.is_admin


def can_delete_project(user: models.Users) -> bool:
    """
    Kann der User Projekte löschen?
    - Admin: Ja
    - Employee: Nein
    - Guest: Nein
    """
    return user.is_admin


def can_manage_project_members(user: models.Users) -> bool:
    """
    Kann der User Mitglieder zu Projekten hinzufügen/entfernen?
    - Admin: Ja
    - Employee: Nein
    - Guest: Nein
    """
    return user.is_admin


def can_view_documents(db: Session, user: models.Users, project_id: int) -> bool:
    """
    Kann der User Dokumente in diesem Projekt sehen?
    - Admin: Ja (alle)
    - Employee: Ja (wenn Projektmitglied)
    - Guest: Ja (wenn Projektmitglied) - READ ONLY
    """
    if user.is_admin:
        return True
    return is_project_member(db, user.id, project_id)


def can_upload_documents(db: Session, user: models.Users, project_id: int) -> bool:
    """
    Kann der User Dokumente hochladen?
    - Admin: Ja
    - Employee: Ja (wenn Projektmitglied)
    - Guest: Nein
    """
    if user.is_guest:
        return False
    if user.is_admin:
        return True
    return is_project_member(db, user.id, project_id)


def can_delete_documents(db: Session, user: models.Users, project_id: int, document: models.Document) -> bool:
    """
    Kann der User dieses Dokument löschen?
    - Admin: Ja (alle)
    - Employee: Nur eigene hochgeladene Dokumente
    - Guest: Nein
    """
    if user.is_guest:
        return False
    if user.is_admin:
        return True
    # Employee kann nur eigene Dokumente löschen
    return document.uploaded_by == user.id


def can_view_project_todos(db: Session, user: models.Users, project_id: int) -> bool:
    """
    Kann der User ToDos in diesem Projekt sehen?
    - Admin: Ja
    - Employee: Ja (wenn Projektmitglied)
    - Guest: Ja (wenn Projektmitglied) - READ ONLY
    """
    if user.is_admin:
        return True
    return is_project_member(db, user.id, project_id)


def can_create_project_todos(db: Session, user: models.Users, project_id: int) -> bool:
    """
    Kann der User ToDos in diesem Projekt erstellen?
    - Admin: Ja
    - Employee: Ja (wenn Projektmitglied)
    - Guest: Nein
    """
    if user.is_guest:
        return False
    if user.is_admin:
        return True
    return is_project_member(db, user.id, project_id)


def can_edit_project_todo(db: Session, user: models.Users, todo: models.ProjectToDo) -> bool:
    """
    Kann der User dieses ToDo bearbeiten?
    - Admin: Ja (alle)
    - Employee: Ja (wenn Projektmitglied)
    - Guest: Nein
    """
    if user.is_guest:
        return False
    if user.is_admin:
        return True
    return is_project_member(db, user.id, todo.project_id)


def can_delete_project_todo(db: Session, user: models.Users, todo: models.ProjectToDo) -> bool:
    """
    Kann der User dieses ToDo löschen?
    - Admin: Ja (alle)
    - Employee: Nur eigene erstellte ToDos
    - Guest: Nein
    """
    if user.is_guest:
        return False
    if user.is_admin:
        return True
    return todo.created_by == user.id


def can_assign_todos(user: models.Users) -> bool:
    """
    Kann der User ToDos anderen Usern zuweisen?
    - Admin: Ja
    - Employee: Nein (nur Admin kann zuweisen)
    - Guest: Nein
    """
    return user.is_admin


def can_manage_users(user: models.Users) -> bool:
    """
    Kann der User andere User verwalten (erstellen, bearbeiten, löschen)?
    - Admin: Ja
    - Employee: Nein
    - Guest: Nein
    """
    return user.is_admin


def can_view_all_users(user: models.Users) -> bool:
    """
    Kann der User alle User sehen?
    - Admin: Ja
    - Employee: Nein (nur sich selbst)
    - Guest: Nein
    """
    return user.is_admin


# ==================== DECORATORS / DEPENDENCIES ====================

def require_admin(user: models.Users):
    """Dependency: Erfordert Admin-Rechte"""
    if not user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
    return user


def require_employee_or_admin(user: models.Users):
    """Dependency: Erfordert mindestens Employee-Rechte"""
    if user.is_guest:
        raise HTTPException(
            status_code=403,
            detail="Guests cannot perform this action"
        )
    return user


def require_active_user(user: models.Users):
    """Dependency: Erfordert aktiven User"""
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="User account is inactive"
        )
    return user


# ==================== PERMISSION MATRIX (für Dokumentation) ====================
"""
╔═══════════════════════════════════════════════════════════════════════════════╗
║                         BERECHTIGUNGS-MATRIX                                  ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ Aktion                          │ Admin │ Mitarbeiter │ Guest                 ║
╠═════════════════════════════════╪═══════╪═════════════╪═══════════════════════╣
║ PROJEKTE                        │       │             │                       ║
║ ├─ Alle Projekte sehen          │  ✓    │     ✗       │   ✗                   ║
║ ├─ Zugewiesene Projekte sehen   │  ✓    │     ✓       │   ✓                   ║
║ ├─ Projekt erstellen            │  ✓    │     ✗       │   ✗                   ║
║ ├─ Projekt bearbeiten           │  ✓    │     ✗       │   ✗                   ║
║ ├─ Projekt löschen              │  ✓    │     ✗       │   ✗                   ║
║ └─ Mitglieder verwalten         │  ✓    │     ✗       │   ✗                   ║
╠═════════════════════════════════╪═══════╪═════════════╪═══════════════════════╣
║ DOKUMENTE (in zugewiesenen      │       │             │                       ║
║            Projekten)           │       │             │                       ║
║ ├─ Dokumente ansehen            │  ✓    │     ✓       │   ✓                   ║
║ ├─ Dokumente hochladen          │  ✓    │     ✓       │   ✗                   ║
║ ├─ Eigene Dokumente löschen     │  ✓    │     ✓       │   ✗                   ║
║ └─ Alle Dokumente löschen       │  ✓    │     ✗       │   ✗                   ║
╠═════════════════════════════════╪═══════╪═════════════╪═══════════════════════╣
║ PROJECT TODOS (in zugewiesenen  │       │             │                       ║
║                Projekten)       │       │             │                       ║
║ ├─ ToDos ansehen                │  ✓    │     ✓       │   ✓                   ║
║ ├─ ToDos erstellen              │  ✓    │     ✓       │   ✗                   ║
║ ├─ ToDos bearbeiten             │  ✓    │     ✓       │   ✗                   ║
║ ├─ Eigene ToDos löschen         │  ✓    │     ✓       │   ✗                   ║
║ ├─ Alle ToDos löschen           │  ✓    │     ✗       │   ✗                   ║
║ └─ ToDos zuweisen               │  ✓    │     ✗       │   ✗                   ║
╠═════════════════════════════════╪═══════╪═════════════╪═══════════════════════╣
║ PERSÖNLICHE TODOS               │       │             │                       ║
║ ├─ Eigene ToDos ansehen         │  ✓    │     ✓       │   ✓                   ║
║ ├─ Eigene ToDos erstellen       │  ✓    │     ✓       │   ✗                   ║
║ ├─ Eigene ToDos bearbeiten      │  ✓    │     ✓       │   ✗                   ║
║ └─ Eigene ToDos löschen         │  ✓    │     ✓       │   ✗                   ║
╠═════════════════════════════════╪═══════╪═════════════╪═══════════════════════╣
║ USER VERWALTUNG                 │       │             │                       ║
║ ├─ Alle User sehen              │  ✓    │     ✗       │   ✗                   ║
║ ├─ User erstellen               │  ✓    │     ✗       │   ✗                   ║
║ ├─ User bearbeiten              │  ✓    │     ✗       │   ✗                   ║
║ ├─ User löschen                 │  ✓    │     ✗       │   ✗                   ║
║ └─ Eigenes Profil bearbeiten    │  ✓    │     ✓       │   ✓                   ║
╚═════════════════════════════════╧═══════╧═════════════╧═══════════════════════╝
"""