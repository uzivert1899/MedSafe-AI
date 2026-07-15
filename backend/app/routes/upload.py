from fastapi import APIRouter, UploadFile, File
import os
from datetime import datetime

from app.services.pdf_service import extract_text_from_pdf
from app.services.lab_parser import extract_lab_values
from app.services.risk_service import analyze_risk
from app.services.gemini_service import generate_health_summary
from app.services.chain_service import run_analysis_chain
from app.services.agent_service import run_lab_agent, run_medicine_agent, run_risk_orchestrator
from app.services.pdf_report_service import generate_pdf_report   # ← New import

router = APIRouter()

UPLOAD_DIR = "uploads"
REPORTS_DIR = "uploads/reports"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)


@router.post("/upload-report")
async def upload_report(file: UploadFile = File(...), run_agents: bool = False):

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    extracted_text = extract_text_from_pdf(file_path)
    lab_values = extract_lab_values(extracted_text)
    risks = analyze_risk(lab_values)
    summary = generate_health_summary(lab_values, risks)
    chain_analysis = run_analysis_chain(extracted_text)

    lab_agent_output = None
    medicine_agent_output = None
    orchestrator_output = None

    if run_agents:
        try:
            print("🚀 Running agents...")
            lab_agent_output = run_lab_agent(extracted_text)
            medicine_agent_output = run_medicine_agent([], chain_analysis)
            orchestrator_output = run_risk_orchestrator(lab_agent_output, medicine_agent_output or chain_analysis)
            print("✅ Agents completed")
        except Exception as e:
            print(f"Agent failed: {e}")
            lab_agent_output = f"Agent failed: {str(e)}"
            orchestrator_output = "Orchestrator skipped due to error."

    # Generate Professional PDF Report
    report_data = {
        "patient_name": "John Doe",           # You can improve this later by extracting from PDF
        "lab_values": lab_values,
        "risks": risks,
        "summary": summary,
        "chain_analysis": chain_analysis,
        "current_medicines": []               # Update later when you extract medicines
    }

    pdf_filename = f"MedSafe_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    pdf_path = generate_pdf_report(report_data, pdf_filename)

    return {
        "message": "File uploaded successfully",
        "filename": file.filename,
        "lab_values": lab_values,
        "risks": risks,
        "summary": summary,
        "chain_analysis": chain_analysis,
        "lab_agent_output": lab_agent_output,
        "medicine_agent_output": medicine_agent_output,
        "orchestrator_output": orchestrator_output,
        "pdf_report_url": f"/downloads/{pdf_filename}",   # You can serve this later
        "pdf_filename": pdf_filename,
        "text": extracted_text[:700] + "..." if len(extracted_text) > 700 else extracted_text
    }