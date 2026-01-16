#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Stopping FinCoach-AI Services       ${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to kill process by PID file
kill_by_pid_file() {
    if [ -f "$1" ]; then
        PID=$(cat "$1")
        if ps -p $PID > /dev/null 2>&1; then
            kill -9 $PID 2>/dev/null
            echo -e "${GREEN}✓ Stopped process with PID: $PID${NC}"
        fi
        rm "$1"
    fi
}

# Function to kill process on port
kill_port() {
    if lsof -ti:$1 > /dev/null 2>&1; then
        lsof -ti:$1 | xargs kill -9 2>/dev/null
        echo -e "${GREEN}✓ Killed process on port $1${NC}"
    fi
}

# Stop services by PID
echo "Stopping services by PID..."
kill_by_pid_file ".backend.pid"
kill_by_pid_file ".ml.pid"
kill_by_pid_file ".frontend.pid"

# Ensure ports are freed
echo -e "\nEnsuring ports are freed..."
kill_port 8080
kill_port 8000
kill_port 5173

echo -e "\n${GREEN}All services stopped!${NC}"
echo -e "${BLUE}========================================${NC}\n"
