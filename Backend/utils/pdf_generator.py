# Backend/utils/pdf_generator.py

"""
PDF Generator für Verträge
Verwendet ReportLab für PDF-Erstellung
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.pdfgen import canvas
from io import BytesIO
from datetime import datetime
from PIL import Image as PILImage


def generate_contract_pdf(contract):
    """
    Generiert ein PDF für einen Vertrag mit Unterschriften
    
    Args:
        contract: Contract Model Objekt
        
    Returns:
        bytes: PDF als Bytes
    """
    
    buffer = BytesIO()
    
    # PDF Setup
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#0a0f33'),
        spaceAfter=30,
        alignment=1  # Center
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#0a0f33'),
        spaceAfter=12,
        spaceBefore=20
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=11,
        leading=16
    )
    
    # Content
    story = []
    
    # Header
    story.append(Paragraph("VERTRAGSVEREINBARUNG", title_style))
    story.append(Spacer(1, 0.5*cm))
    
    # Contract Title
    story.append(Paragraph(contract.title, heading_style))
    story.append(Spacer(1, 0.3*cm))
    
    # Contract Type Badge
    type_labels = {
        "construction": "Tunnelbauvertrag",
        "maintenance": "Wartungsvertrag",
        "consulting": "Beratungsvertrag"
    }
    contract_type = type_labels.get(contract.document_type, contract.document_type)
    
    story.append(Paragraph(f"<b>Vertragsart:</b> {contract_type}", normal_style))
    story.append(Spacer(1, 0.5*cm))
    
    # Parties
    story.append(Paragraph("VERTRAGSPARTEIEN", heading_style))
    
    parties_data = [
        ["Partei A (Unser Unternehmen):", contract.party_a],
        ["Partei B (Auftraggeber/nehmer):", contract.party_b]
    ]
    
    parties_table = Table(parties_data, colWidths=[7*cm, 10*cm])
    parties_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f5f5f5')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
    ]))
    
    story.append(parties_table)
    story.append(Spacer(1, 0.5*cm))
    
    # Contract Details
    story.append(Paragraph("VERTRAGSDETAILS", heading_style))
    
    details_data = [
        ["Vertragswert:", f"{contract.contract_value:,.2f} {contract.currency}"],
        ["Startdatum:", contract.start_date.strftime("%d.%m.%Y")],
        ["Enddatum:", contract.end_date.strftime("%d.%m.%Y")],
    ]
    
    details_table = Table(details_data, colWidths=[7*cm, 10*cm])
    details_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f5f5f5')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
    ]))
    
    story.append(details_table)
    story.append(Spacer(1, 0.5*cm))
    
    # Terms & Conditions
    if contract.terms:
        story.append(Paragraph("ZUSÄTZLICHE BEDINGUNGEN", heading_style))
        story.append(Paragraph(contract.terms, normal_style))
        story.append(Spacer(1, 0.5*cm))
    
    # Signatures Section
    story.append(Spacer(1, 1*cm))
    story.append(Paragraph("UNTERSCHRIFTEN", heading_style))
    story.append(Spacer(1, 0.5*cm))
    
    # Signature Table
    sig_data = []
    
    # Row 1: Signature Images
    row1 = []
    
    if contract.signature_party_a:
        sig_a_img = get_signature_image(contract.signature_party_a)
        row1.append(sig_a_img)
    else:
        row1.append(Paragraph("_______________________", normal_style))
    
    if contract.signature_party_b:
        sig_b_img = get_signature_image(contract.signature_party_b)
        row1.append(sig_b_img)
    else:
        row1.append(Paragraph("_______________________", normal_style))
    
    sig_data.append(row1)
    
    # Row 2: Names
    sig_data.append([
        Paragraph(f"<b>{contract.signature_employee_name or contract.party_a}</b>", normal_style),
        Paragraph(f"<b>{contract.party_b}</b>", normal_style)
    ])
    
    # Row 3: Labels
    sig_data.append([
        Paragraph("Partei A", normal_style),
        Paragraph("Partei B", normal_style)
    ])
    
    # Row 4: Date
    if contract.signature_date:
        date_str = contract.signature_date.strftime("%d.%m.%Y")
    else:
        date_str = "_____________"
    
    sig_data.append([
        Paragraph(f"Datum: {date_str}", normal_style),
        Paragraph(f"Datum: {date_str}", normal_style)
    ])
    
    sig_table = Table(sig_data, colWidths=[8.5*cm, 8.5*cm])
    sig_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, 0), 0),
    ]))
    
    story.append(sig_table)
    
    # Footer
    story.append(Spacer(1, 1*cm))
    footer_text = f"Erstellt am: {datetime.utcnow().strftime('%d.%m.%Y %H:%M')} | Vertrags-ID: {contract.id}"
    story.append(Paragraph(footer_text, ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.grey,
        alignment=1
    )))
    
    # Build PDF
    doc.build(story)
    
    # Get PDF bytes
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes


def get_signature_image(signature_bytes):
    """
    Konvertiert Signature Bytes zu ReportLab Image
    """
    try:
        # Lade Signature als PIL Image
        sig_buffer = BytesIO(signature_bytes)
        pil_img = PILImage.open(sig_buffer)
        
        # Konvertiere zu RGB falls nötig
        if pil_img.mode != 'RGB':
            pil_img = pil_img.convert('RGB')
        
        # Speichere zu BytesIO
        img_buffer = BytesIO()
        pil_img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        # Erstelle ReportLab Image
        img = Image(img_buffer, width=6*cm, height=3*cm)
        
        return img
        
    except Exception as e:
        print(f"Error loading signature image: {e}")
        # Fallback zu Platzhalter
        return Paragraph("_______________________", getSampleStyleSheet()['Normal'])