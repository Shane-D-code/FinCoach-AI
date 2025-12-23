#!/bin/bash
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Starting ML Service on port 8000 in background with logging to ml_service.log..."
nohup python ml_main.py > ml_service.log 2>&1 &
