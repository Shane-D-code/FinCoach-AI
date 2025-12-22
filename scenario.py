from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np

app = FastAPI(title="Scenario Simulator API")

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
        # Handle Prophet model directly
        model = artifacts
        sim_data = None
        config = {}
except FileNotFoundError:
    print("No scenario model found, using rule-based simulation")
    sim_data = None
    model = None
    config = {}

# ===============================
# Input schema
# ===============================
class ScenarioInput(BaseModel):
    income: float
    expenses: float
    risk_factor: float = 0.5
    duration_months: int = 12

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
# Endpoint
# ===============================
@app.post("/simulate")
def simulate_scenario(input_data: ScenarioInput):
    # ---- Case 1: Rule-based simulation
    if model is None:
        return run_simulation(input_data)

    # ---- Case 2: Prophet-based forecasting
    try:
        # Create future dataframe for Prophet
        future_dates = pd.date_range(start='2024-01-01', periods=input_data.duration_months, freq='M')
        future_df = pd.DataFrame({'ds': future_dates})
        
        # Make prediction
        forecast = model.predict(future_df)
        predicted_value = forecast['yhat'].iloc[-1]
        
        return {
            "predicted_outcome": float(predicted_value),
            "forecast_trend": "increasing" if predicted_value > 0 else "decreasing",
            "duration_months": input_data.duration_months
        }
    except Exception as e:
        # Fallback to rule-based if Prophet fails
        return run_simulation(input_data)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)