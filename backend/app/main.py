from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from app.api import members, ml, auth
from app.database import engine
from app.models import user

from app.init_db import init_database

# Initialize database tables and seed demo accounts / datasets
init_database()

load_dotenv()

app = FastAPI(
    title="MPLADS Intelligence API",
    description="National MPLADS Monitoring & Decision Support Platform API",
    version="1.0.0"
)

# CORS configuration
raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,https://mplads-sih.onrender.com").split(",")
origins = [o.strip() for o in raw_origins if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https://.*\.onrender\.com$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(members.router, prefix="/api/members", tags=["Members"])
app.include_router(ml.router, prefix="/api/ml", tags=["Machine Learning"])

@app.get("/")
def read_root():
    return {"message": "MPLADS Intelligence API is running"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
