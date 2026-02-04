#!/bin/bash
set -e

# Wait for PostgreSQL to be ready
until pg_isready -U postgres; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done

# Create replication slot if it doesn't exist
psql -U postgres -c "SELECT * FROM pg_create_physical_replication_slot('replication_slot');" || true

echo "Replication slot created successfully"
