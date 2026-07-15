from pydantic import BaseModel
from typing import Optional
from enum import Enum

class RiskLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"

class LabParameter(BaseModel):
    name: str
    value: float
    unit: str
    status: str                    # "normal", "high", "low"
    risk_level: RiskLevel

class MedicineCheckRequest(BaseModel):
    current_medicines: list[str]
    past_medicines: list[str] = []
    lab_summary: str = ""

class AgentAnalysisResult(BaseModel):
    lab_agent_output: str
    medicine_agent_output: str
    orchestrator_output: str
    overall_risk: str

class UploadResponse(BaseModel):
    filename: str
    lab_values: dict
    risks: list
    summary: str                   # existing Gemini summary
    chain_analysis: str            # new — LangChain RAG analysis
    agent_analysis: Optional[AgentAnalysisResult] = None