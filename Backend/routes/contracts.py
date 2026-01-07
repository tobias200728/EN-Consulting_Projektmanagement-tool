# Backend/routes/contracts.py

"""Contract Routes - PDF Generation & Management"""
from fastapi import APIRouter, HTTPException, Depends, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from io import BytesIO
import base64

from database import SessionLocal
import models
import Rbac
from utils.helpers import get_user
from utils.pdf_generator import generate_contract_pdf

router = APIRouter(tags=["Contracts"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class ContractCreate(BaseModel):
    project_id: int
    document_type: str
    title: str
    party_a: str
    party_b: str
    contract_value: float
    currency: str = "EUR"
    start_date: str
    end_date: str
    terms: Optional[str] = None


class ContractSignature(BaseModel):
    contract_id: int
    signature_party_a: str  # Base64
    signature_employee_name: str
    signature_party_b: str  # Base64


@router.post("/contracts")
async def create_contract(
    data: ContractCreate, 
    user_id: int, 
    db: Session = Depends(get_db)
):
    """
    Erstellt einen neuen Vertrag (ohne Unterschriften)
    """
    user = get_user(user_id, db)
    
    # Nur Admins können Verträge erstellen
    if not Rbac.can_manage_project_members(user):
        raise HTTPException(
            status_code=403, 
            detail="Only admins can create contracts"
        )
    
    # Prüfe ob Projekt existiert
    project = db.query(models.Project).filter(
        models.Project.id == data.project_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    try:
        # Parse dates
        start_date_obj = datetime.strptime(data.start_date, "%Y-%m-%d").date()
        end_date_obj = datetime.strptime(data.end_date, "%Y-%m-%d").date()
        
        # Erstelle Contract (OHNE Unterschriften)
        db_contract = models.Contract(
            project_id=data.project_id,
            document_type=data.document_type,
            title=data.title,
            party_a=data.party_a,
            party_b=data.party_b,
            contract_value=data.contract_value,
            currency=data.currency,
            start_date=start_date_obj,
            end_date=end_date_obj,
            terms=data.terms,
            status="draft",
            created_by=user_id
        )
        
        db.add(db_contract)
        db.commit()
        db.refresh(db_contract)
        
        return {
            "status": "ok",
            "message": "Contract created successfully",
            "contract": format_contract_response(db_contract)
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"Error creating contract: {str(e)}"
        )


@router.post("/contracts/{contract_id}/sign")
async def sign_contract(
    contract_id: int,
    data: ContractSignature,
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Fügt Unterschriften hinzu und generiert finales PDF
    """
    user = get_user(user_id, db)
    
    contract = db.query(models.Contract).filter(
        models.Contract.id == contract_id
    ).first()
    
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    try:
        # Decode Base64 Signaturen
        sig_a_bytes = base64.b64decode(data.signature_party_a)
        sig_b_bytes = base64.b64decode(data.signature_party_b)
        
        # Update Contract mit Signaturen
        contract.signature_party_a = sig_a_bytes
        contract.signature_employee_name = data.signature_employee_name
        contract.signature_party_b = sig_b_bytes
        contract.signature_date = datetime.utcnow()
        contract.status = "signed"
        
        # Generiere PDF mit Unterschriften
        pdf_bytes = generate_contract_pdf(contract)
        contract.pdf_content = pdf_bytes
        
        db.commit()
        db.refresh(contract)
        
        return {
            "status": "ok",
            "message": "Contract signed successfully",
            "contract": format_contract_response(contract)
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error signing contract: {str(e)}"
        )


@router.get("/contracts/{contract_id}/download")
async def download_contract(
    contract_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Download des fertigen PDFs
    """
    user = get_user(user_id, db)
    
    contract = db.query(models.Contract).filter(
        models.Contract.id == contract_id
    ).first()
    
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    if not contract.pdf_content:
        raise HTTPException(status_code=404, detail="PDF not yet generated")
    
    # Check permissions
    if not Rbac.can_view_project(db, user, contract.project_id):
        raise HTTPException(
            status_code=403,
            detail="You don't have access to this contract"
        )
    
    # Return PDF as download
    filename = f"contract_{contract.id}_{contract.title.replace(' ', '_')}.pdf"
    
    return Response(
        content=contract.pdf_content,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@router.get("/projects/{project_id}/contracts")
async def get_project_contracts(
    project_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Gibt alle Verträge eines Projekts zurück
    """
    user = get_user(user_id, db)
    
    if not Rbac.can_view_project(db, user, project_id):
        raise HTTPException(
            status_code=403,
            detail="You don't have access to this project"
        )
    
    contracts = db.query(models.Contract).filter(
        models.Contract.project_id == project_id
    ).order_by(models.Contract.created_at.desc()).all()
    
    contracts_list = [format_contract_response(c) for c in contracts]
    
    return {
        "status": "ok",
        "contracts": contracts_list,
        "total": len(contracts_list)
    }


@router.delete("/contracts/{contract_id}")
async def delete_contract(
    contract_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Löscht einen Vertrag (nur Admins)
    """
    user = get_user(user_id, db)
    
    if not Rbac.can_manage_project_members(user):
        raise HTTPException(
            status_code=403,
            detail="Only admins can delete contracts"
        )
    
    contract = db.query(models.Contract).filter(
        models.Contract.id == contract_id
    ).first()
    
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    try:
        db.delete(contract)
        db.commit()
        
        return {
            "status": "ok",
            "message": "Contract deleted successfully"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting contract: {str(e)}"
        )


def format_contract_response(contract):
    """Formatiert Contract für Response"""
    return {
        "id": contract.id,
        "project_id": contract.project_id,
        "document_type": contract.document_type,
        "title": contract.title,
        "party_a": contract.party_a,
        "party_b": contract.party_b,
        "contract_value": contract.contract_value,
        "currency": contract.currency,
        "start_date": str(contract.start_date) if contract.start_date else None,
        "end_date": str(contract.end_date) if contract.end_date else None,
        "terms": contract.terms,
        "status": contract.status,
        "has_pdf": contract.pdf_content is not None,
        "signature_employee_name": contract.signature_employee_name,
        "signature_date": contract.signature_date.isoformat() if contract.signature_date else None,
        "created_at": contract.created_at.isoformat() if contract.created_at else None
    }