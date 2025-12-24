from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np

app = FastAPI(title="Risk Assessment LightGBM API")

# ===============================
# Load artifacts
# ===============================
artifacts = joblib.load("model/risk_lgbm_model.pkl")

model = artifacts["model"]
train_columns = artifacts["columns"]
cat_cols = artifacts["cat_cols"]

# ===============================
# Input schema (flexible JSON)
# ===============================
class RiskInput(BaseModel):
    data: dict  # key-value pairs of features

# ===============================
# Prediction endpoint
# ===============================
@app.post("/assess-risk")
def assess_risk(input_data: RiskInput):
    # Convert input dict to DataFrame
    X = pd.DataFrame([input_data.data])

    # -------------------------------
    # Handle categorical columns
    # -------------------------------
    for col in cat_cols:
        if col in X.columns:
            X[col] = X[col].astype("category")
        else:
            X[col] = pd.Series([np.nan], dtype="category")

    # -------------------------------
    # Add missing columns
    # -------------------------------
    missing_cols = set(train_columns) - set(X.columns)
    for col in missing_cols:
        X[col] = 0

    # -------------------------------
    # Reorder columns
    # -------------------------------
    X = X[train_columns]

    # -------------------------------
    # Predict
    # -------------------------------
    risk_score = model.predict(X)[0]

    return {
        "risk_score": float(risk_score),
        "risk_label": "HIGH" if risk_score > 0.7 else "MEDIUM" if risk_score > 0.4 else "LOW"
    }
