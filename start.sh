#!/bin/sh

# Start FastAPI services
uvicorn auth.main:app --host 0.0.0.0 --port 8000 &
uvicorn product.main:app --host 0.0.0.0 --port 8001 &
uvicorn order.main:app --host 0.0.0.0 --port 8002 &
uvicorn user.main:app --host 0.0.0.0 --port 8003 &

# Start Next.js app
npm run start --prefix /app/frontend