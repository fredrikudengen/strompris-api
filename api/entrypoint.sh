#!/bin/bash
until pg_isready -h db -U admin; do
    echo "Venter på databasen..."
    sleep 2
done
alembic upgrade head
uvicorn main:app --host 0.0.0.0 --port 8000