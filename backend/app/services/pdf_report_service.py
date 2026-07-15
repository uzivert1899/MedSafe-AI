import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from datetime import datetime

def generate_pdf_report(data, filename="health_report.pdf"):
    filepath = f"uploads/reports/{filename}"
    os.makedirs("uploads/reports", exist_ok=True)

    doc = SimpleDocTemplate(filepath, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []

    # Header
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=18, alignment=1, spaceAfter=20)
    story.append(Paragraph("MedSafe-AI Clinical Health Report", title_style))
    story.append(Paragraph(f"Generated on: {datetime.now().strftime('%d %B, %Y')}", styles['Normal']))
    story.append(Spacer(1, 20))

    # Patient Info
    story.append(Paragraph(f"<b>Patient:</b> {data.get('patient_name', 'John Doe')}", styles['Heading2']))
    story.append(Spacer(1, 12))

    # At a Glance
    story.append(Paragraph("At a Glance", styles['Heading2']))
    table_data = [
        ["Parameters Checked", str(len(data.get('lab_values', {})))],
        ["Risks Flagged", str(len(data.get('risks', [])))],
        ["Medicines Reviewed", str(len(data.get('current_medicines', [])))],
        ["Analysis Mode", "RAG + AI Agents"]
    ]
    t = Table(table_data, colWidths=[3*inch, 3*inch])
    t.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 1, colors.grey),
                           ('BACKGROUND', (0,0), (-1,0), colors.lightblue)]))
    story.append(t)
    story.append(Spacer(1, 20))

    # Clinical Summary
    story.append(Paragraph("Clinical Summary", styles['Heading2']))
    story.append(Paragraph(data.get('chain_analysis', ''), styles['Normal']))
    story.append(Spacer(1, 20))

    # Recommendations
    story.append(Paragraph("Key Recommendations", styles['Heading2']))
    story.append(Paragraph(data.get('summary', ''), styles['Normal']))

    story.append(Spacer(1, 30))
    story.append(Paragraph("Disclaimer: This report is AI-generated for informational purposes only and does not replace professional medical advice.", 
                          ParagraphStyle('Disclaimer', parent=styles['Normal'], fontSize=9, textColor=colors.red)))

    doc.build(story)
    return filepath