from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from database import Base

class Users(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    isadmin = Column(Boolean, default=False)

  
    twofa_enabled = Column(Boolean, default=False)
    twofa_secret = Column(String, nullable=True)
    
    # Password Reset Code
    reset_code = Column(String, nullable=True)
    reset_code_expires = Column(Integer, nullable=True)  # Unix timestamp


class Room(Base):
    __tablename__= 'rooms'

    id = Column(Integer, primary_key=True, index=True)
    roomname = Column(String, index=True)
