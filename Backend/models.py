from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, Float, Date, LargeBinary, ARRAY
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

    # Profile Picture (bytea in PostgreSQL)
    profile_picture = Column(LargeBinary, nullable=True)

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
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)  # vorher: due_date
    interim_dates = Column(ARRAY(Date), nullable=False)  # Array von Daten
    
    # Foreign Keys
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)

    # Relationships
    creator = relationship("Users", foreign_keys=[created_by])


# ✅ NEU: Projekt-Meilensteine Tabelle
class ProjectMilestone(Base):
    __tablename__ = 'project_milestones'

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    title = Column(String(255), nullable=False)  # z.B. "1. Zwischenpräsentation"
    description = Column(Text, nullable=True)
    milestone_date = Column(Date, nullable=False)
    status = Column(String(50), default='pending')  # pending, completed
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project")
    creator = relationship("Users")


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
    due_date = Column(Date, nullable=False)  # ✅ GEÄNDERT: nullable=False (Pflichtfeld!)

    # Relationships
    project = relationship("Project")
    assignee = relationship("Users", foreign_keys=[assigned_to])
    creator = relationship("Users", foreign_keys=[created_by])

class ProjectImage(Base):
    __tablename__ = 'project_images'

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    image_data = Column(LargeBinary, nullable=False)
    filename = Column(String(255), nullable=True)
    uploaded_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project")
    uploader = relationship("Users")
    
class UserTodo(Base):
    __tablename__ = 'user_todos'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default='todo')  # todo, in-progress, completed
    priority = Column(String(50), default='medium')  # low, medium, high
    due_date = Column(Date, nullable=True)

    # Relationships
    user = relationship("Users")


class Contract(Base):
    __tablename__ = 'contracts'

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    
    # Contract Details
    document_type = Column(String(50), nullable=False)  # construction, maintenance, consulting
    title = Column(String(255), nullable=False)
    
    # Parties
    party_a = Column(String(255), nullable=False)  # Our company
    party_b = Column(String(255), nullable=False)  # Client/Contractor
    
    # Contract Terms
    contract_value = Column(Float, nullable=False)
    currency = Column(String(10), default='EUR')
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    terms = Column(Text, nullable=True)  # Additional terms & conditions
    
    # File Storage
    pdf_content = Column(LargeBinary, nullable=True)  # Store PDF directly
    sharepoint_url = Column(String(500), nullable=True)  # Or store SharePoint link
    
    # Signatures (stored as images)
    signature_party_a = Column(LargeBinary, nullable=True)
    signature_employee_name = Column(String(255), nullable=True)
    signature_party_b = Column(LargeBinary, nullable=True)
    signature_date = Column(DateTime, nullable=True)
    
    # Metadata
    status = Column(String(50), default='draft')  # draft, signed, completed
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project")
    creator = relationship("Users", foreign_keys=[created_by])


class Document(Base):
    __tablename__ = 'documents'

    id = Column(Integer, primary_key=True, index=True)
    
    # Association
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=True)
    contract_id = Column(Integer, ForeignKey('contracts.id'), nullable=True)
    
    # File Details
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    filetype = Column(String(100), nullable=False)
    filesize = Column(Integer, nullable=False)  # in bytes
    
    # Storage
    filepath = Column(String(500), nullable=True)  # Local path or SharePoint path
    filedata = Column(LargeBinary, nullable=True)  # Or store file directly
    
    # Metadata
    uploaded_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project")
    contract = relationship("Contract")
    uploader = relationship("Users")
    

# Enum für User Roles (für RBAC)
class UserRole:
    ADMIN = "admin"
    EMPLOYEE = "employee"
    GUEST = "guest"