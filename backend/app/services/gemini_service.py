import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

# Using fast model to avoid rate limits
llm = ChatGroq(
    model="llama-3.1-8b-instant",
    groq_api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.1,
    max_tokens=1500,          # Balanced for summary
)

def generate_health_summary(lab_values, risks):
    prompt_template = """
    Lab Values:
    {lab_values}

    Risks:
    {risks}

    Generate a clean, well-structured patient-friendly response with:
    1. Patient Summary (2-3 sentences)
    2. Health Risks
    3. Recommendations (actionable and practical)

    Use simple, easy-to-understand language.
    """

    prompt = ChatPromptTemplate.from_template(prompt_template)
    chain = prompt | llm | StrOutputParser()

    try:
        return chain.invoke({
            "lab_values": lab_values,
            "risks": risks
        })
    except Exception as e:
        print(f"Error in generate_health_summary: {e}")
        return "Error generating health summary. Please try again later."


def analyze_medicine_risks(current_info, past_info, lab_risks):
    prompt_template = """
    You are a medical AI assistant. Analyze the following medicines and lab risks.
    
    Current Medicines:
    {current_info}
    
    Past Medicines (last 3 months):
    {past_info}
    
    Existing Lab Risk Warnings:
    {lab_risks}
    
    Generate:
    1. Summary of what each current medicine does (simple language)
    2. Any dangerous interactions between current and past medicines
    3. Do any medicines worsen the existing lab risks?
    4. Key recommendations — what the patient should tell the doctor

    Be specific, use simple language, avoid complex medical jargon.
    """

    prompt = ChatPromptTemplate.from_template(prompt_template)
    chain = prompt | llm | StrOutputParser()

    try:
        return chain.invoke({
            "current_info": current_info,
            "past_info": past_info,
            "lab_risks": lab_risks
        })
    except Exception as e:
        print(f"Error in analyze_medicine_risks: {e}")
        return "Error analyzing medicine risks. Please try again later."