#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  FinCoach-AI Complete Startup Script  ${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to check if port is in use
check_port() {
    lsof -ti:$1 > /dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    if check_port $1; then
        echo -e "${RED}Port $1 is in use. Killing existing process...${NC}"
        lsof -ti:$1 | xargs kill -9 2>/dev/null
        sleep 2
    fi
}

# Clean up ports
kill_port 8080  # Backend
kill_port 8000  # ML Service
kill_port 5173  # Frontend

# 1. Start Backend (Spring Boot)
echo -e "\n${GREEN}[1/3] Starting Backend (Spring Boot on port 8080)...${NC}"
cd backend
if [ ! -f "target/fincoach-backend-1.0.0.jar" ]; then
    echo "Building backend..."
    ./mvnw clean package -DskipTests
fi
nohup java -jar target/fincoach-backend-1.0.0.jar > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"
cd ..

# 2. Start ML Service (FastAPI)
echo -e "\n${GREEN}[2/3] Starting ML Service (FastAPI on port 8000)...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python3 not found. Please install Python 3.${NC}"
    exit 1
fi

echo "Installing Python dependencies..."
pip3 install -r requirements.txt > /dev/null 2>&1

nohup python3 ml_main.py > ml_service.log 2>&1 &
ML_PID=$!
echo "ML Service started with PID: $ML_PID"

# 3. Start Frontend (Vite + React)
echo -e "\n${GREEN}[3/3] Starting Frontend (Vite on port 5173)...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm not found. Please install Node.js and npm.${NC}"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

# Wait for services to start
echo -e "\n${BLUE}Waiting for services to initialize...${NC}"
sleep 5

# Check service health
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}         Service Status Check          ${NC}"
echo -e "${BLUE}========================================${NC}"

if check_port 8080; then
    echo -e "${GREEN}✓ Backend:  Running on http://localhost:8080${NC}"
else
    echo -e "${RED}✗ Backend:  Failed to start${NC}"
fi

if check_port 8000; then
    echo -e "${GREEN}✓ ML Service: Running on http://localhost:8000${NC}"
else
    echo -e "${RED}✗ ML Service: Failed to start${NC}"
fi

if check_port 5173; then
    echo -e "${GREEN}✓ Frontend: Running on http://localhost:5173${NC}"
else
    echo -e "${RED}✗ Frontend: Failed to start${NC}"
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}All services started!${NC}"
echo -e "\n${BLUE}Access the application:${NC}"
echo -e "  Frontend:   ${GREEN}http://localhost:5173${NC}"
echo -e "  Backend:    ${GREEN}http://localhost:8080${NC}"
echo -e "  ML Service: ${GREEN}http://localhost:8000${NC}"
echo -e "\n${BLUE}Logs:${NC}"
echo -e "  Backend:    tail -f backend.log"
echo -e "  ML Service: tail -f ml_service.log"
echo -e "  Frontend:   tail -f frontend.log"
echo -e "\n${BLUE}To stop all services:${NC}"
echo -e "  ./stop-all.sh"
echo -e "${BLUE}========================================${NC}\n"

# Save PIDs for later cleanup
echo "$BACKEND_PID" > .backend.pid
echo "$ML_PID" > .ml.pid
echo "$FRONTEND_PID" > .frontend.pid
