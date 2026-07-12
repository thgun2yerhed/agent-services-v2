#!/bin/bash
# Query registry for active agents
# Replace 'REGISTRY_ENDPOINT' with actual target protocol URL
curl -s -X GET https://registry.agent-protocol.dev/nodes > registry_cache.json
# Extract current peer list
grep -o 'http[s]*://[^"]*' registry_cache.json > active_peers.txt
