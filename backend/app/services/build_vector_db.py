"""
build_vector_db.py

One-time (or periodic) indexing script that replaces the old 20-hardcoded-doc
ChromaDB setup with a real dataset:
  - ~200 drugs pulled live from OpenFDA's label endpoint
  - ~35 lab parameter reference ranges (manually curated, since OpenFDA has no lab data)

Each drug's label is split into multiple smaller documents (warnings,
drug_interactions, contraindications, boxed_warning) rather than one giant
blob per drug, since smaller chunks retrieve more precisely.

Run from backend/ with:
    python -m app.services.build_vector_db

Safe to re-run: it wipes and rebuilds the 'medsafe_knowledge' collection.
"""

import os
import time
import requests
from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_core.documents import Document

from app.drug_list import DRUG_LIST

load_dotenv()

CHROMA_PATH = "chroma_db"
OPENFDA_URL = "https://api.fda.gov/drug/label.json"

embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")


# ──────────────────────────────────────────────────────────
# Lab reference ranges (expanded from 10 to ~35 parameters)
# ──────────────────────────────────────────────────────────

LAB_DOCS = [
    Document(page_content="Normal hemoglobin: Men 13.5-17.5 g/dL, Women 12-15.5 g/dL. Below 8 g/dL is severe anemia requiring urgent attention.", metadata={"source": "lab", "param": "hemoglobin"}),
    Document(page_content="Normal hematocrit: Men 38.8-50.0%, Women 34.9-44.5%. Low hematocrit indicates anemia or blood loss; high indicates dehydration or polycythemia.", metadata={"source": "lab", "param": "hematocrit"}),
    Document(page_content="Normal creatinine: Men 0.7-1.3 mg/dL, Women 0.6-1.1 mg/dL. Above 2.0 mg/dL indicates significant kidney impairment.", metadata={"source": "lab", "param": "creatinine"}),
    Document(page_content="Normal BUN (blood urea nitrogen): 7-20 mg/dL. Elevated BUN suggests reduced kidney function or dehydration.", metadata={"source": "lab", "param": "bun"}),
    Document(page_content="Normal eGFR: above 90 mL/min/1.73m2. Below 60 for 3+ months indicates chronic kidney disease. Below 15 indicates kidney failure.", metadata={"source": "lab", "param": "egfr"}),
    Document(page_content="Normal fasting glucose: 70-100 mg/dL. 100-125 mg/dL is pre-diabetes. Above 126 mg/dL fasting confirms diabetes.", metadata={"source": "lab", "param": "glucose"}),
    Document(page_content="Normal HbA1c: below 5.7%. 5.7-6.4% is pre-diabetes. 6.5% or above confirms diabetes.", metadata={"source": "lab", "param": "hba1c"}),
    Document(page_content="Normal total cholesterol: below 200 mg/dL. Borderline high 200-239 mg/dL. High above 240 mg/dL.", metadata={"source": "lab", "param": "cholesterol"}),
    Document(page_content="Normal LDL cholesterol: below 100 mg/dL is optimal. Above 160 mg/dL is high and increases cardiovascular risk.", metadata={"source": "lab", "param": "ldl"}),
    Document(page_content="Normal HDL cholesterol: above 60 mg/dL is protective. Below 40 mg/dL (men) or 50 mg/dL (women) increases cardiovascular risk.", metadata={"source": "lab", "param": "hdl"}),
    Document(page_content="Normal triglycerides: below 150 mg/dL. Above 500 mg/dL increases risk of pancreatitis.", metadata={"source": "lab", "param": "triglycerides"}),
    Document(page_content="Normal WBC (white blood cell count): 4.5-11.0 x10^9/L. High suggests infection, inflammation, or leukemia. Low suggests immune suppression.", metadata={"source": "lab", "param": "wbc"}),
    Document(page_content="Normal platelet count: 150-400 x10^9/L. Below 50 significantly increases bleeding risk. Above 450 increases clotting risk.", metadata={"source": "lab", "param": "platelets"}),
    Document(page_content="Normal sodium: 136-145 mEq/L. Below 125 or above 155 can cause seizures, confusion, or coma.", metadata={"source": "lab", "param": "sodium"}),
    Document(page_content="Normal potassium: 3.5-5.0 mEq/L. Below 2.5 or above 6.5 mEq/L can cause life-threatening cardiac arrhythmias.", metadata={"source": "lab", "param": "potassium"}),
    Document(page_content="Normal chloride: 98-107 mEq/L. Abnormal levels often accompany sodium or acid-base disturbances.", metadata={"source": "lab", "param": "chloride"}),
    Document(page_content="Normal calcium: 8.5-10.5 mg/dL. Severe hypercalcemia (above 14) or hypocalcemia (below 6) is a medical emergency.", metadata={"source": "lab", "param": "calcium"}),
    Document(page_content="Normal magnesium: 1.7-2.2 mg/dL. Low magnesium can cause arrhythmias and muscle cramps; often seen with diuretic or PPI use.", metadata={"source": "lab", "param": "magnesium"}),
    Document(page_content="Normal total bilirubin: 0.2-1.2 mg/dL. Above 2.5 mg/dL causes visible jaundice and suggests liver disease or hemolysis.", metadata={"source": "lab", "param": "bilirubin"}),
    Document(page_content="Normal ALT (alanine aminotransferase): 7-56 U/L. Elevated ALT indicates liver cell damage or inflammation.", metadata={"source": "lab", "param": "alt"}),
    Document(page_content="Normal AST (aspartate aminotransferase): 10-40 U/L. Elevated AST suggests liver, heart, or muscle damage.", metadata={"source": "lab", "param": "ast"}),
    Document(page_content="Normal alkaline phosphatase (ALP): 44-147 U/L. Elevated ALP suggests liver or bone disease.", metadata={"source": "lab", "param": "alp"}),
    Document(page_content="Normal albumin: 3.4-5.4 g/dL. Low albumin suggests liver disease, malnutrition, or kidney protein loss.", metadata={"source": "lab", "param": "albumin"}),
    Document(page_content="Normal TSH: 0.4-4.0 mIU/L. High TSH indicates hypothyroidism. Low TSH indicates hyperthyroidism.", metadata={"source": "lab", "param": "tsh"}),
    Document(page_content="Normal free T4: 0.8-1.8 ng/dL. Low free T4 with high TSH confirms primary hypothyroidism.", metadata={"source": "lab", "param": "free_t4"}),
    Document(page_content="Normal CRP (C-reactive protein): below 3.0 mg/L. Elevated CRP indicates active inflammation or infection.", metadata={"source": "lab", "param": "crp"}),
    Document(page_content="Normal ESR (erythrocyte sedimentation rate): Men 0-22 mm/hr, Women 0-29 mm/hr. Elevated ESR indicates inflammation, infection, or autoimmune disease.", metadata={"source": "lab", "param": "esr"}),
    Document(page_content="Normal INR (international normalized ratio): 0.8-1.1 for healthy individuals. Patients on warfarin typically target 2.0-3.0. Above 4.5 significantly increases bleeding risk.", metadata={"source": "lab", "param": "inr"}),
    Document(page_content="Normal PT (prothrombin time): 11-13.5 seconds. Prolonged PT suggests clotting factor deficiency or anticoagulant use.", metadata={"source": "lab", "param": "pt"}),
    Document(page_content="Normal uric acid: Men 3.4-7.0 mg/dL, Women 2.4-6.0 mg/dL. Elevated uric acid causes gout and kidney stones.", metadata={"source": "lab", "param": "uric_acid"}),
    Document(page_content="Normal vitamin D (25-hydroxyvitamin D): 30-100 ng/mL. Below 20 ng/mL is deficiency, associated with bone and immune issues.", metadata={"source": "lab", "param": "vitamin_d"}),
    Document(page_content="Normal vitamin B12: 200-900 pg/mL. Low B12 causes anemia and neurological symptoms.", metadata={"source": "lab", "param": "vitamin_b12"}),
    Document(page_content="Normal ferritin: Men 24-336 ng/mL, Women 11-307 ng/mL. Low ferritin indicates iron deficiency; very high ferritin can indicate inflammation or iron overload.", metadata={"source": "lab", "param": "ferritin"}),
    Document(page_content="Normal CK (creatine kinase): 30-200 U/L. Elevated CK suggests muscle damage, including statin-induced rhabdomyolysis.", metadata={"source": "lab", "param": "ck"}),
    Document(page_content="Normal lipase: 10-140 U/L (varies by assay). Elevated lipase suggests pancreatitis.", metadata={"source": "lab", "param": "lipase"}),
]


# ──────────────────────────────────────────────────────────
# OpenFDA fetching + chunking
# ──────────────────────────────────────────────────────────

def fetch_drug_label(drug_name: str) -> dict | None:
    """Fetch one drug's label from OpenFDA. Returns None if not found or on error."""
    try:
        name_quoted = drug_name.replace(" ", "+")
        search_query = f'openfda.generic_name:"{name_quoted}"+OR+openfda.brand_name:"{name_quoted}"'
        url = f"{OPENFDA_URL}?search={search_query}&limit=1"

        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return None
        data = response.json()
        results = data.get("results")
        if not results:
            return None
        return results[0]
    except Exception:
        return None


def build_drug_documents(drug_name: str, label: dict) -> list[Document]:
    """
    Split one drug's label into separate documents per section.
    Each chunk is capped to keep embeddings focused and retrieval precise.
    """
    docs = []

    def add_section(field_name: str, doc_type: str, max_chars: int = 600):
        values = label.get(field_name)
        if values and isinstance(values, list) and values[0].strip():
            text = values[0][:max_chars]
            docs.append(
                Document(
                    page_content=f"{drug_name.title()} — {doc_type}: {text}",
                    metadata={"source": "drug", "drug": drug_name, "type": doc_type},
                )
            )

    add_section("drug_interactions", "drug interactions")
    add_section("warnings", "warnings")
    add_section("boxed_warning", "boxed warning (serious risk)")
    add_section("contraindications", "contraindications")
    add_section("indications_and_usage", "indications and usage", max_chars=300)

    return docs


def get_vectorstore() -> Chroma:
    return Chroma(
        collection_name="medsafe_knowledge",
        embedding_function=embeddings,
        persist_directory=CHROMA_PATH,
    )


def index_knowledge_base(drug_limit: int | None = None, delay: float = 0.15):
    """
    Rebuilds the ChromaDB collection from scratch using:
      - live OpenFDA data for drugs in DRUG_LIST
      - manually curated LAB_DOCS

    drug_limit: optionally cap how many drugs to fetch (useful for quick tests)
    delay: seconds to sleep between OpenFDA requests to stay well under rate limits
    """
    vectorstore = get_vectorstore()

    print("Wiping existing collection...")
    try:
        existing = vectorstore.get()
        if existing and existing.get("ids"):
            vectorstore.delete(ids=existing["ids"])
    except Exception as e:
        print(f"  (no existing data to wipe, or wipe failed harmlessly: {e})")

    drugs_to_index = DRUG_LIST[:drug_limit] if drug_limit else DRUG_LIST
    print(f"Fetching {len(drugs_to_index)} drugs from OpenFDA...")

    all_drug_docs = []
    not_found = []

    for i, drug in enumerate(drugs_to_index, 1):
        label = fetch_drug_label(drug)
        if label is None:
            not_found.append(drug)
        else:
            docs = build_drug_documents(drug, label)
            all_drug_docs.extend(docs)
        if i % 20 == 0:
            print(f"  ...{i}/{len(drugs_to_index)} processed")
        time.sleep(delay)

    print(f"Drug documents created: {len(all_drug_docs)}")
    print(f"Drugs not found in OpenFDA: {len(not_found)}")
    if not_found:
        print(f"  Skipped: {', '.join(not_found[:30])}{'...' if len(not_found) > 30 else ''}")

    all_docs = all_drug_docs + LAB_DOCS
    print(f"Indexing {len(all_docs)} total documents into ChromaDB...")

    batch_size = 100
    for i in range(0, len(all_docs), batch_size):
        batch = all_docs[i:i + batch_size]
        vectorstore.add_documents(batch)
        print(f"  Indexed batch {i // batch_size + 1} ({len(batch)} docs)")

    print(f"Done. Total documents indexed: {len(all_docs)}")
    print(f"  - Drug documents: {len(all_drug_docs)}")
    print(f"  - Lab reference documents: {len(LAB_DOCS)}")


def retrieve_context(query: str, k: int = 4) -> str:
    vs = get_vectorstore()
    results = vs.similarity_search(query, k=k)
    if not results:
        return "No relevant context found."
    return "\n\n".join([doc.page_content for doc in results])


if __name__ == "__main__":
    index_knowledge_base()