"""Project Images Routes"""
from fastapi import APIRouter, HTTPException, Depends, File, UploadFile
from fastapi.responses import Response
from sqlalchemy.orm import Session
from database import SessionLocal
import models
import Rbac
from utils.helpers import get_user
import base64

router = APIRouter(tags=["Project Images"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/projects/{project_id}/images")
async def upload_project_image(
    project_id: int,
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    user = get_user(user_id, db)

    if not Rbac.can_view_project(db, user, project_id):
        raise HTTPException(status_code=403, detail="No access to this project")

    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: JPG, PNG, GIF, WEBP")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(status_code=400, detail="File too large. Max: 10MB")

    try:
        db_image = models.ProjectImage(
            project_id=project_id,
            image_data=contents,
            filename=file.filename,
            uploaded_by=user_id
        )
        db.add(db_image)
        db.commit()
        db.refresh(db_image)

        return {
            "status": "ok",
            "message": "Image uploaded successfully",
            "image": {
                "id": db_image.id,
                "filename": db_image.filename,
                "uploaded_at": db_image.uploaded_at.isoformat()
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error uploading image: {str(e)}")


@router.get("/projects/{project_id}/images")
async def get_project_images(
    project_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    user = get_user(user_id, db)

    if not Rbac.can_view_project(db, user, project_id):
        raise HTTPException(status_code=403, detail="No access to this project")

    images = db.query(models.ProjectImage).filter(
        models.ProjectImage.project_id == project_id
    ).order_by(models.ProjectImage.uploaded_at.desc()).all()

    images_list = []
    for img in images:
        images_list.append({
            "id": img.id,
            "filename": img.filename,
            "image_data": base64.b64encode(img.image_data).decode('utf-8'),
            "uploaded_at": img.uploaded_at.isoformat() if img.uploaded_at else None,
            "uploaded_by": img.uploaded_by
        })

    return {
        "status": "ok",
        "images": images_list,
        "total": len(images_list)
    }


@router.delete("/projects/{project_id}/images/{image_id}")
async def delete_project_image(
    project_id: int,
    image_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    user = get_user(user_id, db)

    if not Rbac.can_edit_project(db, user, project_id):
        raise HTTPException(status_code=403, detail="Only admins can delete images")

    image = db.query(models.ProjectImage).filter(
        models.ProjectImage.id == image_id,
        models.ProjectImage.project_id == project_id
    ).first()

    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    try:
        db.delete(image)
        db.commit()
        return {"status": "ok", "message": "Image deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting image: {str(e)}")