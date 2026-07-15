import json
import re
import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.1,
    max_tokens=2048,
)

def extract_lab_values(text: str):
    prompt_template = """
    Extract all lab test values from this medical report text.
    Return ONLY a valid JSON object with parameter names as keys and numeric values as strings.
    
    Example: {{"hemoglobin": "11.5", "creatinine": "1.8", "wbc": "6.2", "platelets": "150"}}

    Rules:
    - Only include parameters that have a numeric value
    - Do not include units, just the numeric value
    - Use lowercase keys with underscores for spaces
    - Do not add any explanation or extra text, just the JSON object

    Report text:
    {text}
    """

    prompt = ChatPromptTemplate.from_template(prompt_template)
    chain = prompt | llm | StrOutputParser()

    try:
        response = chain.invoke({"text": text})
        raw = response.strip()
        raw = re.sub(r"```json|```", "", raw).strip()

        return json.loads(raw)
    except Exception as e:
        print(f"Error extracting lab values: {e}")
        return {}