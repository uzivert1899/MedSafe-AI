import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from .rag_service import retrieve_context

load_dotenv()

# Using fast model to avoid rate limits
llm = ChatGroq(
    model="llama-3.1-8b-instant",
    groq_api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.1,
    max_tokens=1500,          # Balanced
)

def run_analysis_chain(lab_report_text: str) -> str:
    context = retrieve_context(lab_report_text)

    prompt = ChatPromptTemplate.from_template("""
    You are MedSafe AI, a clinical lab report analysis assistant.

    Medical reference knowledge:
    {context}

    Patient lab report:
    {lab_report}

    Provide a structured response with:
    1. Patient Summary (2-3 sentences)
    2. Each abnormal parameter (value, why it matters, risk level: LOW/MODERATE/HIGH/CRITICAL)
    3. Overall Risk Level: LOW / MODERATE / HIGH / CRITICAL
    4. Critical Flags (only urgent concerns)
    5. Specific Recommendations (3-5 actionable points)

    Be clinically precise and ground your analysis in the provided reference knowledge.
    """)

    chain = prompt | llm | StrOutputParser()
    return chain.invoke({
        "context": context, 
        "lab_report": lab_report_text
    })


def run_medicine_chain(medicines: list[str], lab_summary: str) -> str:
    query = f"{' '.join(medicines)} {lab_summary}"
    context = retrieve_context(query)

    prompt = ChatPromptTemplate.from_template("""
    You are a clinical pharmacist AI.

    Medical reference knowledge:
    {context}

    Patient lab summary:
    {lab_summary}

    Medicines to evaluate:
    {medicines}

    For each medicine:
    1. What it does (simple language)
    2. Any dangerous interaction with this patient's lab values
    3. Severity: LOW / MODERATE / HIGH / CRITICAL
    4. Recommendation: continue / adjust dose / stop / monitor closely

    Ground your response in the reference knowledge above. Be concise.
    """)

    chain = prompt | llm | StrOutputParser()
    return chain.invoke({
        "context": context,
        "lab_summary": lab_summary,
        "medicines": ", ".join(medicines)
    })