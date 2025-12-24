from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Optional

app = FastAPI(title="Expense Forecasting API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model once
try:
    model = joblib.load("model/expense_forecasting_model.pkl")
    print("Expense forecasting model loaded successfully")
except Exception as e:
    print(f"Warning: Could not load expense forecasting model: {e}")
    model = None

# Define request/response models
class ExpenseForecastRequest(BaseModel):
    userId: Optional[int] = Field(None, validation_alias='user_id')
    monthlyIncome: float = Field(..., validation_alias='monthly_income')
    currentExpenses: float = Field(..., validation_alias='current_expenses')
    category: Optional[str] = None
    months: int = Field(default=3, ge=1, le=12)
    
    class Config:
        populate_by_name = True

class MonthlyForecast(BaseModel):
    month: str
    predicted_expense: float
    confidence_low: float
    confidence_high: float

class ExpenseForecastResponse(BaseModel):
    forecasts: List[MonthlyForecast]
    total_forecasted: float
    average_monthly: float
    trend: str  # "increasing", "decreasing", "stable"
    recommendations: List[str]

@app.post("/forecast", response_model=ExpenseForecastResponse)
def forecast_expenses(request: ExpenseForecastRequest):
    """
    Forecast future expenses based on current spending patterns
    """
    try:
        # Generate forecasts for the requested number of months
        forecasts = []
        current_date = datetime.now()
        
        # Base expense calculation
        base_expense = request.currentExpenses
        income_ratio = request.currentExpenses / request.monthlyIncome if request.monthlyIncome > 0 else 0.5
        
        # Simple trend analysis (in production, use the ML model)
        # For now, using a rule-based approach with slight variations
        monthly_predictions = []
        
        for i in range(request.months):
            month_date = current_date + timedelta(days=30 * (i + 1))
            month_str = month_date.strftime("%B %Y")
            
            # Add seasonal variation and trend
            seasonal_factor = 1 + (0.1 * np.sin(2 * np.pi * month_date.month / 12))
            trend_factor = 1 + (0.02 * i)  # Slight upward trend
            
            predicted = base_expense * seasonal_factor * trend_factor
            monthly_predictions.append(predicted)
            
            # Calculate confidence interval (±10%)
            confidence_low = predicted * 0.9
            confidence_high = predicted * 1.1
            
            forecasts.append(MonthlyForecast(
                month=month_str,
                predicted_expense=round(predicted, 2),
                confidence_low=round(confidence_low, 2),
                confidence_high=round(confidence_high, 2)
            ))
        
        # Calculate statistics
        total_forecasted = sum(monthly_predictions)
        average_monthly = total_forecasted / len(monthly_predictions)
        
        # Determine trend
        if monthly_predictions[-1] > monthly_predictions[0] * 1.05:
            trend = "increasing"
        elif monthly_predictions[-1] < monthly_predictions[0] * 0.95:
            trend = "decreasing"
        else:
            trend = "stable"
        
        # Generate recommendations
        recommendations = []
        if income_ratio > 0.7:
            recommendations.append("Your expenses are high relative to income. Consider creating a budget to reduce spending.")
        if trend == "increasing":
            recommendations.append("Your expenses are trending upward. Review discretionary spending to control costs.")
        if average_monthly > request.monthlyIncome * 0.5:
            recommendations.append("Consider setting aside at least 20% of income for savings and investments.")
        if len(recommendations) == 0:
            recommendations.append("Your spending is well-managed. Keep tracking to maintain financial health.")
        
        return ExpenseForecastResponse(
            forecasts=forecasts,
            total_forecasted=round(total_forecasted, 2),
            average_monthly=round(average_monthly, 2),
            trend=trend,
            recommendations=recommendations
        )
        
    except Exception as e:
        # Fallback response
        return ExpenseForecastResponse(
            forecasts=[],
            total_forecasted=0.0,
            average_monthly=0.0,
            trend="unknown",
            recommendations=[f"Error generating forecast: {str(e)}"]
        )

@app.get("/health")
def health_check():
    return {
        "status": "up",
        "model_loaded": model is not None
    }