"""
EN-Consulting API - Main Application
Strukturierte Version mit separaten Route-Modulen
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine

# Route Imports
from routes import users, auth, projects, project_members, project_todos, user_todos

# Erstelle Datenbank-Tabellen
models.Base.metadata.create_all(bind=engine)

# FastAPI App Initialisierung
app = FastAPI(
    title="EN-Consulting API",
    description="Project Management Tool API - Strukturierte Version",
    version="2.0.0",
    openapi_tags=[
        {"name": "User Management"},
        {"name": "Authentication"},
        {"name": "Projects"},
        {"name": "Project Members"},
        {"name": "Project TODOs"},
        {"name": "User TODOs"},
    ]
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router Includes
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(project_members.router)
app.include_router(project_todos.router)
app.include_router(user_todos.router)

# Root Endpoint
@app.get("/")
async def root():
    return {
        "message": "EN-Consulting API",
        "version": "2.0.0",
        "status": "online",
        "docs": "/docs"
    }

# Health Check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
