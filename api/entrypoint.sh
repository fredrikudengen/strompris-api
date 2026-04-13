#!/bin/bash
DB_HOST=$(echo $DATABASE_URL | sed 's/.*@\(.*\):.*/\1/')
DB_PORT=$(echo $DATABASE_URL | sed 's/.*:\([0-9]*\)\/.*/\1/')

until pg_isready -h $DB_HOST -p $DB_PORT; do
    echo "Venter på databasen..."
    sleep 2
done
alembic upgrade head
uvicorn main:app --host 0.0.0.0 --port 8000