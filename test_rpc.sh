#!/bin/bash
PROJECT_ENV="./.env"

if [ -f "$PROJECT_ENV" ]; then
    export $(grep -v '^#' "$PROJECT_ENV" | xargs)
fi

if [ ! -z "$BASE_RPC" ]; then
    curl -s -X POST \
         -H "Content-Type: application/json" \
         --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
         "$BASE_RPC"
    echo ""
else
    echo "Error: BASE_RPC variable is unassigned."
fi
