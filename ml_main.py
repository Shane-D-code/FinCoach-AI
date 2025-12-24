from fastapi import FastAPI
import uvicorn
import logging
from risk import app as risk_app
from scenario import app as scenario_app
from nearby import app as nearby_app
from expense import app as expense_app
from market import market_app
from ocr_service import app as ocr_app

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
