from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import base64
from datetime import datetime
from database import SessionLocal


from models import ProjectImage, Project

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ LAZY LOADING: Nur Metadaten zurückgeben (kein Bild-Inhalt)
@router.get("/projects/{project_id}/images")
def get_project_images_metadata(project_id: int, db: Session = Depends(get_db)):
    """
    Gibt nur Metadaten der Projektbilder zurück (id, filename, uploaded_at).
    Kein Base64 - Bilder werden über den Einzelbild-Endpoint lazy geladen.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    images = db.query(ProjectImage).filter(ProjectImage.project_id == project_id).all()

    return {
        "project_id": project_id,
        "images": [
            {
                "id": img.id,
                "filename": img.filename,
                "content_type": getattr(img, "content_type", "image/jpeg"),
                "file_size": getattr(img, "file_size", None),
                "uploaded_at": img.uploaded_at.isoformat() if img.uploaded_at else None,
            }
            for img in images
        ]
    }


# ✅ LAZY LOADING: Einzelnes Bild als Base64 zurückgeben
@router.get("/projects/{project_id}/images/{image_id}")
def get_project_image(project_id: int, image_id: int, db: Session = Depends(get_db)):
    """
    Gibt ein einzelnes Projektbild als Base64 zurück.
    Wird vom Frontend lazy aufgerufen, nachdem die Metadaten geladen wurden.
    """
    image = db.query(ProjectImage).filter(
        ProjectImage.id == image_id,
        ProjectImage.project_id == project_id
    ).first()

    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    if not image.image_data:
        raise HTTPException(status_code=404, detail="Image data not found")

    image_base64 = base64.b64encode(image.image_data).decode("utf-8")
    content_type = getattr(image, "content_type", "image/jpeg") or "image/jpeg"

    return {
        "id": image.id,
        "project_id": project_id,
        "filename": image.filename,
        "content_type": content_type,
        "image_data": image_base64,
        "uploaded_at": image.uploaded_at.isoformat() if image.uploaded_at else None,
    }


# Upload: Bild zu Projekt hinzufügen
@router.post("/projects/{project_id}/images")
async def upload_project_image(
    project_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only images are allowed.")

    contents = await file.read()

    # Max 10MB
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")

    new_image = ProjectImage(
        project_id=project_id,
        image_data=contents,
        filename=file.filename,
        uploaded_at=datetime.now(),
    )

    # Optionale Felder setzen, falls im Modell vorhanden
    if hasattr(new_image, "content_type"):
        new_image.content_type = file.content_type
    if hasattr(new_image, "file_size"):
        new_image.file_size = len(contents)

    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return {
        "status": "ok",
        "id": new_image.id,
        "filename": new_image.filename,
        "uploaded_at": new_image.uploaded_at.isoformat() if new_image.uploaded_at else None,
    }


# Bild löschen
@router.delete("/projects/{project_id}/images/{image_id}")
def delete_project_image(project_id: int, image_id: int, db: Session = Depends(get_db)):
    image = db.query(ProjectImage).filter(
        ProjectImage.id == image_id,
        ProjectImage.project_id == project_id
    ).first()

    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    db.delete(image)
    db.commit()

    return {"status": "ok", "message": "Image deleted successfully"}