from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, Float, Date
from database import Base
from datetime import datetime
from sqlalchemy.orm import relationship


class Users(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    
    # User Info
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    
    # Role: "admin", "employee", "guest"
    role = Column(String(50), default='employee')

    # 2FA
    twofa_enabled = Column(Boolean, default=False)
    twofa_secret = Column(String, nullable=True)
    
    # Password Reset Code
    reset_code = Column(String, nullable=True)
    reset_code_expires = Column(Integer, nullable=True)  # Unix timestamp

    # Properties für RBAC
    @property
    def is_admin(self):
        return self.role == 'admin'
    
    @property
    def is_employee(self):
        return self.role == 'employee'
    
    @property
    def is_guest(self):
        return self.role == 'guest'


class Project(Base):
    __tablename__ = 'projects'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default='planning')  # planning, in-progress, completed, on-hold
    progress = Column(Float, default=0.0)  # 0-100
    due_date = Column(Date, nullable=True)
    
    # Foreign Keys
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)

    # Relationships
    creator = relationship("Users", foreign_keys=[created_by])


class ProjectMember(Base):
    __tablename__ = 'project_members'

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)

    # Relationships
    project = relationship("Project")
    user = relationship("Users")


class ProjectTodo(Base):
    __tablename__ = 'project_todos'

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default='todo')  # todo, in-progress, completed
    priority = Column(String(50), default='medium')  # low, medium, high
    assigned_to = Column(Integer, ForeignKey('users.id'), nullable=True)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    due_date = Column(Date, nullable=True)

    # Relationships
    project = relationship("Project")
    assignee = relationship("Users", foreign_keys=[assigned_to])
    creator = relationship("Users", foreign_keys=[created_by])


class UserTodo(Base):
    __tablename__ = 'user_todos'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default='todo')  # todo, in-progress, completed
    priority = Column(String(50), default='medium')  # low, medium, high
    due_date = Column(Date, nullable=True)
    
    # WICHTIG: created_at und updated_at ENTFERNT, da sie in der DB nicht existieren!

    # Relationships
    user = relationship("Users")


# Enum für User Roles (für RBAC)
class UserRole:
    ADMIN = "admin"
    EMPLOYEE = "employee"
    GUEST = "guest"