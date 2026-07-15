from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes.upload import router as upload_router
from app.routes.medicine import router as medicine_router
import os

app = FastAPI(
    title="MedSafe AI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads/reports", exist_ok=True)
app.mount("/downloads", StaticFiles(directory="uploads/reports"), name="downloads")

app.include_router(upload_router)
app.include_router(medicine_router)

@app.get("/")
def root():
    return {
        "message": "MedSafe AI Backend Running"
    }
