from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np

app = FastAPI(title="Nearby Local Deals API")

# ===============================
# Load pickle
# ===============================
artifact = joblib.load("model/nearby_deals_model.pkl")

# If pickle is a dict (most Kaggle notebooks)
if isinstance(artifact, dict):
    deals_df = artifact.get("deals_df")
    model = artifact.get("model", None)
else:
    model = artifact
    deals_df = None

# ===============================
# Input schema
# ===============================
class DealRequest(BaseModel):
    latitude: float
    longitude: float
    radius_km: float = 5.0
    top_k: int = 10

# ===============================
# Utility: Haversine distance
# ===============================
def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = (
        np.sin(dlat / 2) ** 2
        + np.cos(np.radians(lat1))
        * np.cos(np.radians(lat2))
        * np.sin(dlon / 2) ** 2
    )
    return 2 * R * np.arcsin(np.sqrt(a))

# ===============================
# Endpoint
# ===============================
@app.post("/nearby-deals")
def get_nearby_deals(req: DealRequest):

    # ---------- CASE 1: LOGIC / DATAFRAME BASED ----------
    if deals_df is not None:
        df = deals_df.copy()

        df["distance_km"] = haversine(
            req.latitude,
            req.longitude,
            df["latitude"],
            df["longitude"]
        )

        df = df[df["distance_km"] <= req.radius_km]
        df = df.sort_values("distance_km").head(req.top_k)

        return {
            "count": len(df),
            "deals": df.to_dict(orient="records")
        }

    # ---------- CASE 2: MODEL BASED ----------
    if model is not None:
        X = pd.DataFrame([{
            "latitude": req.latitude,
            "longitude": req.longitude,
            "radius_km": req.radius_km
        }])

        prediction = model.predict(X)

        return {
            "result": prediction.tolist()
        }

    return {"error": "Invalid pickle structure"}
