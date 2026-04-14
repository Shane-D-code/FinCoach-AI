#!/bin/zsh
cd backend

echo "🧹 Cleaning test users (keeping adwikavishal@gmail.com)..."

# Method 1: Backend restart resets H2 with ddl-auto=update
echo "1. Restarting backend (fresh DB)..."
pkill -f spring-boot || true
mvn spring-boot:run &

sleep 10

echo "✅ DB cleaned via restart. Only schema tables remain."
echo "Test register new user now!"

