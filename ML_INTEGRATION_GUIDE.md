# ML Integration Guide

This project now integrates Python-based ML models with the Spring Boot Backend.

## Components
1. **Java Backend**: Uses `MLService` to call ML endpoints. Configured in `application.yml` with `app.ml.url`.
2. **Python ML Service**: Uses FastAPI to expose models via HTTP. Entry point: `ml_main.py`.

## Running the Application
To ensure full functionality, you must run both the Java Backend and the Python ML Service.

### 1. Start Python ML Service
Open a terminal in the root directory and run:
```bash
sh run_ml.sh
```
This will:
- Install dependencies from `requirements.txt`.
- Start the server on `http://localhost:8000`.

### 2. Start Java Backend
Navigate to `backend` and run:
```bash
./mvnw spring-boot:run
```
The backend will connect to the ML service at `http://localhost:8000`.

## Endpoints
The Java Backend exposes these ML-integrated endpoints:
- `POST /api/ml/scenario/simulate`: Simulates financial scenarios.
- `POST /api/ml/risk/assess`: Assesses financial risk based on input data.
- `POST /api/ml/nearby/deals`: Finds nearby deals (requires Location data).
- `POST /api/ml/ocr/transactions`: (Mock) Ingests OCR transaction data.

## Configuration
To change the ML Service URL, edit `backend/src/main/resources/application.yml`:
```yaml
app:
  ml:
    url: http://localhost:8000
```
