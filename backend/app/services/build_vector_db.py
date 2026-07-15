import os
import time
import requests
from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_community.embeddings import FastEmbedEmbeddings
from langchain_core.documents import Document

from app.drug_list import DRUG_LIST

load_dotenv()

CHROMA_PATH = "chroma_db"
OPENFDA_URL = "https://api.fda.gov/drug/label.json"

# Lightweight ONNX-based embeddings
embeddings = FastEmbedEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# Lab reference ranges (unchanged)
LAB_DOCS = [
    Document(page_content="Normal hemoglobin: Men 13.5-17.5 g/dL, Women 12-15.5 g/dL.", metadata={"source": "lab", "param": "hemoglobin"}),
    # ... keep the rest of your lab docs as-is ...
]

def fetch_drug_label(drug_name: str) -> dict | None:
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
    vectorstore = get_vectorstore()
    print("Wiping existing collection...")
    try:
        existing = vectorstore.get()
        if existing and existing.get("ids"):
            vectorstore.delete(ids=existing["ids"])
    except Exception as e:
        print(f"(no existing data to wipe, or wipe failed harmlessly: {e})")

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
            print(f"...{i}/{len(drugs_to_index)} processed")
        time.sleep(delay)

    print(f"Drug documents created: {len(all_drug_docs)}")
    print(f"Drugs not found in OpenFDA: {len(not_found)}")
    if not_found:
        print(f"Skipped: {', '.join(not_found[:30])}{'...' if len(not_found) > 30 else ''}")

    all_docs = all_drug_docs + LAB_DOCS
    print(f"Indexing {len(all_docs)} total documents into ChromaDB...")

    batch_size = 100
    for i in range(0, len(all_docs), batch_size):
        batch = all_docs[i:i + batch_size]
        vectorstore.add_documents(batch)
        print(f"Indexed batch {i // batch_size + 1} ({len(batch)} docs)")

    print(f"Done. Total documents indexed: {len(all_docs)}")

def retrieve_context(query: str, k: int = 4) -> str:
    vs = get_vectorstore()
    results = vs.similarity_search(query, k=k)
    if not results:
        return "No relevant context found."
    return "\n\n".join([doc.page_content for doc in results])

if __name__ == "__main__":
    index_knowledge_base()
