from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

from app.services.openfda_service import get_multiple_medicines
from app.services.gemini_service import analyze_medicine_risks
from app.services.chain_service import run_medicine_chain
from app.services.agent_service import run_medicine_agent, run_risk_orchestrator

router = APIRouter()


class MedicineInput(BaseModel):
    current_medicines: List[str]
    past_medicines: List[str] = []
    lab_risks: List[str] = []
    lab_summary: str = ""


@router.post("/analyze-medicines")
async def analyze_medicines(data: MedicineInput, run_agents: bool = False):

    # Fetch medicine info from OpenFDA
    current_info = get_multiple_medicines(data.current_medicines)
    past_info = get_multiple_medicines(data.past_medicines) if data.past_medicines else {}

    # Non-agent analysis
    gemini_analysis = analyze_medicine_risks(
        current_info=current_info,
        past_info=past_info,
        lab_risks=data.lab_risks
    )

    lab_summary = data.lab_summary or "\n".join(data.lab_risks)

    # Include BOTH current and past medicines — past medicines can still
    # have residual interactions, which is the whole point of tracking them
    all_medicines = data.current_medicines + data.past_medicines

    chain_analysis = run_medicine_chain(all_medicines, lab_summary)

    medicine_agent_output = None
    orchestrator_output = None

    if run_agents:
        try:
            print("🚀 Running medicine agents...")
            medicine_agent_output = run_medicine_agent(all_medicines, lab_summary)
            orchestrator_output = run_risk_orchestrator(medicine_agent_output, chain_analysis)
            print("✅ Medicine agents completed")
        except Exception as e:
            print(f"Medicine agent failed: {e}")
            medicine_agent_output = f"Agent failed: {str(e)}"
            orchestrator_output = "Orchestrator skipped due to error."

    return {
        "current_medicines": current_info,
        "past_medicines": past_info,
        "gemini_analysis": gemini_analysis,
        "chain_analysis": chain_analysis,
        "medicine_agent_output": medicine_agent_output,
        "orchestrator_output": orchestrator_output
    }