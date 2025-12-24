from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from typing import List, Dict, Optional
import warnings
warnings.filterwarnings('ignore')

app = FastAPI(title="Enhanced Scenario Simulator API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================
# Load artifacts
# ===============================
try:
    artifacts = joblib.load("model/scenario_simulator.pkl")
    if isinstance(artifacts, dict):
        sim_data = artifacts.get("simulator_data")
        model = artifacts.get("model")
        config = artifacts.get("config", {})
    else:
        model = artifacts
        sim_data = None
        config = {}
except Exception:
    print("No scenario model found, using rule-based simulation")
    sim_data = None
    model = None
    config = {}

# ===============================
# Input schemas
# ===============================
class ScenarioInput(BaseModel):
    income: float
    expenses: float
    risk_factor: float = 0.5
    duration_months: int = 12

class PurchaseRequest(BaseModel):
    current_balance: float = Field(..., validation_alias='currentBalance')
    monthly_income: float = Field(..., validation_alias='monthlyIncome')
    monthly_expenses: float = Field(..., validation_alias='monthlyExpenses')
    purchase_amount: float = Field(..., validation_alias='purchaseAmount')
    
    class Config:
        populate_by_name = True

# ===============================
# Core simulation logic
# ===============================
def run_simulation(data: ScenarioInput):
    savings = (data.income - data.expenses) * data.duration_months
    risk_adjusted = savings * (1 - data.risk_factor)
    return {
        "total_savings": round(savings, 2),
        "risk_adjusted_savings": round(risk_adjusted, 2),
        "status": "GOOD" if risk_adjusted > 50000 else "WARNING"
    }

# ===============================
# Endpoints
# ===============================
@app.post("/simulate")
def simulate_scenario(input_data: ScenarioInput):
    if model is None:
        return run_simulation(input_data)
    try:
        future_dates = pd.date_range(start='2024-01-01', periods=input_data.duration_months, freq='M')
        future_df = pd.DataFrame({'ds': future_dates})
        forecast = model.predict(future_df)
        predicted_value = forecast['yhat'].iloc[-1]
        return {
            "predicted_outcome": float(predicted_value),
            "forecast_trend": "increasing" if predicted_value > 0 else "decreasing",
            "duration_months": input_data.duration_months
        }
    except Exception:
        return run_simulation(input_data)

@app.post("/simulate-purchase")
def simulate_purchase(req: PurchaseRequest):
    new_balance = req.current_balance - req.purchase_amount
    
    # Simple Liquidity Ratio Analysis
    discretionary_income = req.monthly_income - req.monthly_expenses
    recovery_months = 0.0
    
    if discretionary_income > 0:
        recovery_months = req.purchase_amount / discretionary_income
    
    # Risk Calculation
    risk_level = "LOW"
    advice = "Safe to proceed."
    
    balance_threshold = req.monthly_expenses * 0.5 # maintain at least half month expenses buffer
    
    if new_balance < 0:
        risk_level = "CRITICAL"
        advice = "You cannot afford this purchase. It will result in debt."
    elif new_balance < balance_threshold:
        risk_level = "HIGH"
        advice = f"Highly risky. This depletes your safety buffer. It will take approx {recovery_months:.1f} months to recover."
    elif discretionary_income > 0 and req.purchase_amount > (discretionary_income * 3):
         risk_level = "MEDIUM"
         advice = f"Moderate risk. Large purchase. Recovery: {recovery_months:.1f} months."
    
    return {
        "new_balance": round(new_balance, 2),
        "risk_level": risk_level,
        "advice": advice,
        "recovery_months": round(recovery_months, 1) if discretionary_income > 0 else -1
    }