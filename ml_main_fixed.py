from fastapi import FastAPI
import uvicorn
import logging
try:
    from risk import app as risk_app
except:
    print("Warning: risk module not found")
    risk_app = FastAPI()
try:
    from scenario import app as scenario_app
except:
    print("Warning: scenario module not found")
    scenario_app = FastAPI()
try:
    from nearby import app as nearby_app
except:
    print("Warning: nearby module not found")
    nearby_app = FastAPI()
try:
    from expense import app as expense_app
except:
    print("Warning: expense module not found")
    expense_app = FastAPI()
try:
    from market import market_app
except:
    print("Warning: market module not found")
    market_app = FastAPI()
print("Loading OCR service...")
try:
    from ocr_service_fixed import app as ocr_app
    print("✅ OCR service loaded from fixed version")
except:
    print("Warning: using fixed OCR")
    from ocr_service_fixed import app as ocr_app

# Create custom logger
logger = logging.getLogger("ml_service")
logger.setLevel(logging.INFO)

app = FastAPI()

# Mount sub-applications
app.mount("/scenario", scenario_app)
app.mount("/risk", risk_app)
app.mount("/nearby", nearby_app)
app.mount("/expense", expense_app)
app.mount("/market", market_app)
app.mount("/ocr", ocr_app)

@app.get("/health")
def health_check():
    return {
        "status": "healthy", 
        "services": ["risk", "scenario", "nearby", "expense", "market", "ocr"]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
