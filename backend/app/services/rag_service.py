import os
from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_community.embeddings import FastEmbedEmbeddings

load_dotenv()

CHROMA_PATH = "chroma_db"

# Lightweight embedding model (ONNX-based)
embeddings = FastEmbedEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

def get_vectorstore() -> Chroma:
    """Load ChromaDB with real FDA drug labels + lab references"""
    return Chroma(
        collection_name="medsafe_knowledge",
        embedding_function=embeddings,
        persist_directory=CHROMA_PATH
    )

def retrieve_context(query: str, k: int = 4) -> str:
    """Retrieve relevant context from the vector database"""
    try:
        vs = get_vectorstore()
        results = vs.similarity_search(query, k=k)
        
        if not results:
            return "No relevant medical reference found."
        
        return "\n\n".join([doc.page_content for doc in results])
    except Exception as e:
        print(f"Error retrieving context: {e}")
        return "Medical knowledge base is currently unavailable. Please ensure build_vector_db.py has been run."

def check_knowledge_base():
    """Helper function to verify the knowledge base"""
    try:
        vs = get_vectorstore()
        count = vs._collection.count()
        print(f"✅ Knowledge base loaded successfully!")
        print(f"📊 Total documents: {count}")
        return count
    except Exception as e:
        print(f"⚠️ Could not load knowledge base: {e}")
        print("→ Run `python -m app.services.build_vector_db` to index data.")
        return 0

if __name__ == "__main__":
    check_knowledge_base()
