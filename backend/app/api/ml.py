from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import pandas as pd
from app.database import get_db
from app.models.member import Member
from app.ml.risk_engine import MLRiskEngine
from app.auth import RoleChecker
from app.models.user import User

router = APIRouter()
ml_engines = {
    "LOK_SABHA": MLRiskEngine(),
    "RAJYA_SABHA": MLRiskEngine(),
    "ALL": MLRiskEngine()
}

admin_ministry_roles = RoleChecker(["administrator", "ministry"])

@router.get("/status")
def get_ml_status():
    """Returns the health and status of the ML pipeline"""
    return {
        "status": "active",
        "models": [
            {
                "name": "Financial Anomaly Detection",
                "algorithm": "Isolation Forest",
                "type": "Unsupervised",
                "status": "Active" if ml_engines["ALL"].anomaly_detector.is_trained else "Untrained"
            },
            {
                "name": "Duplicate Portfolio Detection",
                "algorithm": "TF-IDF + Cosine Similarity",
                "type": "Unsupervised",
                "status": "Active" if ml_engines["ALL"].duplicate_detector.is_trained else "Untrained"
            }
        ],
        "data_sufficiency": {
            "time_series_forecasting": "Insufficient (No historical timestamps)",
            "supervised_delay_prediction": "Insufficient (No ground-truth labels)"
        }
    }

@router.post("/train")
def train_models(db: Session = Depends(get_db), current_user: User = Depends(admin_ministry_roles)):
    """Triggers retraining of the ML models on current database records"""
    members = db.query(Member).all()
    if not members:
        return {"status": "error", "message": "No data available for training"}
        
    df = pd.DataFrame([{
        "id": m.id,
        "name": m.name,
        "state": m.state,
        "constituency": m.constituency,
        "house": m.house,
        "allocated_amount": m.allocatedAmount
    } for m in members])
    
    ml_engines["ALL"].train_models(df)
    return {"status": "success", "message": "Models trained successfully"}

@router.get("/risk")
def get_risk_analysis(
    house: Optional[str] = Query(None, description="Filter by house (LOK_SABHA or RAJYA_SABHA)"),
    db: Session = Depends(get_db)
):
    """Returns predictive risk analysis for all members"""
    query = db.query(Member)
    if house and house != "ALL":
        db_house = "Lok Sabha" if house == "LOK_SABHA" else "Rajya Sabha"
        query = query.filter(Member.house == db_house)
        
    members = query.all()
    if not members:
        return {"results": []}
        
    df = pd.DataFrame([{
        "id": m.id,
        "name": m.name,
        "state": m.state,
        "constituency": m.constituency,
        "house": m.house,
        "allocated_amount": m.allocatedAmount
    } for m in members])
    
    # Ensure models are trained
    engine_key = house if house in ml_engines else "ALL"
    engine = ml_engines[engine_key]
    
    if not engine.anomaly_detector.is_trained or not engine.duplicate_detector.is_trained:
        engine.train_models(df)
        
    risk_df = engine.analyze_risk(df)
    
    # Replace NaN with None for JSON serialization
    import numpy as np
    risk_df = risk_df.replace({np.nan: None})
    
    # Convert back to list of dicts for JSON
    results = risk_df.reset_index(drop=True).to_dict(orient="records")
    return {"results": results}
