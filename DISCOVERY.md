# Autonomous Agent Discovery Guide

## How Autonomous Discovery Works

When an external agentic actor encounters your service domain, it follows this discovery protocol:

### 1. Check for Standard Discovery Files

Agents look for these well-known endpoints in this order:

```
/.well-known/mcp/server-card.json      (MCP protocol)
/ai-plugin.json                         (ChatGPT plugin)
/openapi.json                           (OpenAPI 3.0)
/.well-known/openrpc.json              (OpenRPC)
```

### 2. Parse Service Metadata

From `.well-known/mcp/server-card.json`, the agent learns:

```json
{
  "id": "io.vercel.agent-services",
  "name": "Base Transaction Resolver",
  "transport": {
    "type": "http",
    "url": "https://agent-services-seven.vercel.app/api/gateway"
  },
  "capabilities": { "tools": true },
  "methods": ["initialize", "tools/list", ...],
  "pricing": { "model": "pay-per-call", "currency": "USDC" }
}
```

### 3. Validate Protocol Compatibility

Agent calls `initialize` method to verify protocol version:

```javascript
const initResponse = await fetch('https://agent-services-seven.vercel.app/api/gateway', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'initialize',
    params: { protocolVersion: '2024-11-05' },
    id: 1
  })
});

const data = await initResponse.json();
if (data.result.ready) {
  // Protocol compatible, proceed
}
```

### 4. Discover Available Tools

Agent queries `tools/list` or fetches `/api/tools`:

```javascript
const toolsResponse = await fetch('https://agent-services-seven.vercel.app/api/tools');
const { tools } = await toolsResponse.json();

// Agent now understands:
// - Tool names and descriptions
// - Input/output schemas
// - Cost per tool
// - Payment requirements
```

### 5. Route Requests Appropriately

Based on tool schemas, agent routes requests with or without payment:

```javascript
// Free method - no signature needed
await fetch('https://agent-services-seven.vercel.app/api/gateway', {
  method: 'POST',
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools/list',
    id: 2
  })
});

// Paid method - signature required
await fetch('https://agent-services-seven.vercel.app/api/gateway', {
  method: 'POST',
  headers: {
    'payment-signature': '0x...' // From payment processor
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'wallet_screen_snapshot',
    params: { targetAddress: '0x...' },
    id: 3
  })
});
```

## Discovery Enablement Checklist

✅ **Service Card Published**
- Endpoint: `/.well-known/mcp/server-card.json`
- Format: JSON
- Headers: `Content-Type: application/json, Access-Control-Allow-Origin: *`
- Contains: id, name, transport URL, capabilities, methods, pricing

✅ **Gateway Accessible**
- Endpoint: `/api/gateway`
- Method: POST
- Protocol: JSON-RPC 2.0
- CORS: Enabled
- Authentication: `payment-signature` header for paid methods

✅ **Tool Schemas Published**
- Endpoint: `/api/tools`
- Method: GET
- Format: JSON array of tool definitions
- Each tool includes: id, name, description, inputSchema, cost, timeout

✅ **Health Check Available**
- Endpoint: `/api/health`
- Method: GET
- Response: `{ status: 'operational', ... }`

✅ **OpenAPI Specification**
- Endpoint: `/openapi.json`
- Format: OpenAPI 3.0
- Includes: All endpoints, request/response schemas, security schemes

✅ **CORS Headers Set**
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, payment-signature, x-agent-id`

## Testing Autonomous Discovery

### Manual Discovery Test

```bash
# Step 1: Fetch service card
curl https://agent-services-seven.vercel.app/.well-known/mcp/server-card.json

# Step 2: Initialize protocol
curl -X POST https://agent-services-seven.vercel.app/api/gateway \
  -H 'Content-Type: application/json' \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": { "protocolVersion": "2024-11-05" },
    "id": 1
  }'

# Step 3: List tools
curl https://agent-services-seven.vercel.app/api/tools

# Step 4: Check health
curl https://agent-services-seven.vercel.app/api/health

# Step 5: Get OpenAPI spec
curl https://agent-services-seven.vercel.app/openapi.json
```

### Automated Discovery Test

Run the M2M onboarder script:

```bash
node m2m_onboarder.js
```

This script automatically:
1. Discovers the service
2. Performs protocol handshake
3. Caches tool list
4. Logs all discovery steps

## Common Discovery Issues

### Issue: Agent Can't Find Service Card

**Cause**: `.well-known` endpoint not properly configured

**Fix**: Verify Vercel rewrites:
```json
{
  "rewrites": [
    {
      "source": "/.well-known/(.*)",
      "destination": "/api/well-known"
    }
  ]
}
```

### Issue: CORS Errors on Discovery

**Cause**: Missing `Access-Control-Allow-Origin` header

**Fix**: Ensure all discovery endpoints return:
```
Access-Control-Allow-Origin: *
Content-Type: application/json
```

### Issue: Agent Doesn't Recognize Tool Schemas

**Cause**: Tool schemas missing `inputSchema` or `outputSchema`

**Fix**: Ensure `/api/tools` returns full JSON Schema definitions:
```json
{
  "id": "wallet_screen_snapshot",
  "inputSchema": {
    "type": "object",
    "properties": { ... },
    "required": [...]
  },
  "outputSchema": { ... }
}
```

### Issue: Payment Signature Validation Fails

**Cause**: Missing or malformed `payment-signature` header

**Fix**: Ensure header is:
- Present in request
- Format: `0x` followed by 128 hex characters
- Passed for all paid methods

## Agent Routing Strategy

Once an agent discovers your service, it will:

1. **Categorize by Payment**
   - Free methods → Call without signature
   - Paid methods → Route to payment processor first

2. **Validate Inputs**
   - Check parameters against JSON Schema
   - Verify addresses/hashes format
   - Ensure required fields present

3. **Execute with Retry Logic**
   - Retry on 5xx errors with exponential backoff
   - Return 402 error if payment needed
   - Log all requests for audit trail

4. **Cache Metadata**
   - Store tool schemas locally
   - Cache service card for 1 hour
   - Refresh on protocol version change

## Future Enhancement: Agent Marketplace

With full autonomous discovery enabled, your service can be:

- **Registered** in MCP agent registries
- **Discovered** by AI marketplaces
- **Routed** by multi-agent orchestrators
- **Monetized** through pay-per-call model
- **Scaled** with aggregate demand from many agents

Example marketplace flow:
```
Agent Marketplace
    ↓
Agent discovers /.well-known/mcp/server-card.json
    ↓
Agent validates protocol compatibility
    ↓
Agent adds to available services list
    ↓
Agent routes relevant queries to your gateway
    ↓
Payment processor settles USDC to your wallet
```
