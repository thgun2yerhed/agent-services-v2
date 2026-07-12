#!/bin/bash
# Broadcast node availability to network
PORT=3000
curl -X POST http://127.0.0.1:$PORT/broadcast \
     -H "Content-Type: application/json" \
     -d '{"status": "online", "endpoint": "http://127.0.0.1:3000"}'
