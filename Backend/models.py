from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime
from database import Base
from datetime import datetime


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
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # 2FA
    twofa_enabled = Column(Boolean, default=False)
    twofa_secret = Column(String, nullable=True)
    
    # Password Reset Code
    reset_code = Column(String, nullable=True)
    reset_code_expires = Column(Integer, nullable=True)  # Unix timestamp