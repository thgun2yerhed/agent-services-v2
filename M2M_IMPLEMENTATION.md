# Machine-to-Machine Commerce Layer Implementation

## Overview

This document describes the complete M2M (Machine-to-Machine) commerce layer implementation for autonomous agent interaction with the Base MCP Resolver service.

## Architecture

### Core Components

1. **API Gateway** (`/api/gateway.js`)
   - JSON-RPC 2.0 protocol handler
   - Payment signature verification
   - Request routing and method dispatch
   - CORS headers for external agent access
   - Logging and request tracking

2. **Tool Schemas** (`/api/tools-schema.js`)
   - Machine-consumable tool definitions
   - Input/output schema validation
   - Cost and timeout metadata
   - Payment requirements per tool

3. **OpenAPI Specification** (`/api/openapi.json`)
   - Full REST/RPC hybrid specification
   - Request/response schemas
   - Security schemes for payment verification
   - Discovery and routing information

4. **Discovery Endpoint** (`.well-known/mcp/server-card.json`)
   - Standard MCP server metadata
   - Capability advertisement
   - Payment model details
   - Pricing information

## Protocol: JSON-RPC 2.0

All M2M requests follow the JSON-RPC 2.0 specification.

### Request Format

```json
{
  "jsonrpc": "2.0",
  "method": "wallet_screen_snapshot",
  "params": {
    "targetAddress": "0x...",
    "method": "basic"
  },
  "id": "unique-request-id"
}
```

### Response Format (Success)

```json
{
  "jsonrpc": "2.0",
  "result": {
    "address": "0x...",
    "screened": true,
    "riskLevel": "low",
    "timestamp": "2024-07-12T..."
  },
  "id": "unique-request-id"
}
```

### Response Format (Error)

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32001,
    "message": "Payment required",
    "requiresPayment": true
  },
  "id": "unique-request-id"
}
```

## Payment Verification

### Headers Required

- `payment-signature`: Cryptographic signature (0x-prefixed hex, 128 chars)
- `x-agent-id`: (Optional) Identifier for calling agent
- `x-request-id`: (Optional) Idempotency key

### Free Methods (No Payment Required)

- `initialize` - Protocol handshake
- `tools/list` - Tool discovery
- `/.well-known/discover` - Service discovery

### Paid Methods (Payment Required)

- `wallet_screen_snapshot` - **1000 USDC** per call
- `transaction_decode` - **500 USDC** per call
- `address_risk_analysis` - **750 USDC** per call

## Implementation Details

### Gateway Handler Flow

```
1. Request arrives at /api/gateway
2. CORS headers set
3. Parse JSON-RPC request body
4. Extract method and params
5. Check if method requires payment
   ├─ Free method: Skip payment verification
   └─ Paid method: Verify payment-signature header
6. Route to appropriate handler
7. Execute handler logic
8. Record settlement (if paid method)
9. Return JSON-RPC response
```

### Payment Settlement

When a paid method is called:

1. Payment signature is verified against facilitator.js
2. Handler executes and returns result
3. Settlement is recorded in `settlements.json` with:
   - Payment signature hash
   - Target address
   - Timestamp
   - Result data
   - Settlement status

### Tool Schema Structure

Each tool in `tools-schema.js` contains:

```javascript
{
  name: "Tool display name",
  description: "Machine-readable description",
  inputSchema: { /* JSON Schema for inputs */ },
  outputSchema: { /* JSON Schema for outputs */ },
  cost: "1000 USDC",
  requiresPayment: true,
  timeout: "30s"
}
```

Agents use these schemas to:
- Validate inputs before sending
- Route requests appropriately
- Display tool capabilities
- Handle errors gracefully

## External Agent Integration

### Discovery Flow

1. Agent queries `.well-known/mcp/server-card.json`
2. Receives service metadata and capabilities
3. Agent queries `/api/tools` to get tool schemas
4. Agent can now route requests to appropriate endpoints

### Example Agent Call

```javascript
// Agent code
const gatewayURL = 'https://agent-services-seven.vercel.app/api/gateway';
const paymentSignature = '0x...' // From payment processor

const response = await fetch(gatewayURL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'payment-signature': paymentSignature,
    'x-agent-id': 'agent-xyz-123',
    'x-request-id': 'req-' + Date.now()
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'wallet_screen_snapshot',
    params: {
      targetAddress: '0xcd339078d159404d29000a6716d962c8833abfe8',
      method: 'basic'
    },
    id: 1
  })
});

const data = await response.json();
console.log(data.result); // Wallet screening result
```

## Error Handling

### Error Codes

| Code | Meaning | Example |
|------|---------|----------|
| -32600 | Invalid Request | Missing required field |
| -32601 | Method not found | Unknown method name |
| -32602 | Invalid params | Wrong parameter types |
| -32603 | Internal error | Server exception |
| -32700 | Parse error | Malformed JSON |
| -32001 | Payment required | Missing payment signature |

### HTTP Status Codes

| Code | Meaning | Recovery |
|------|---------|----------|
| 200 | Success | Normal flow |
| 400 | Bad request | Check JSON-RPC format |
| 402 | Payment required | Provide payment-signature header |
| 405 | Method not allowed | Use POST |
| 500 | Server error | Retry with exponential backoff |

## Deployment

### Vercel Configuration

The `vercel.json` file configures:

```json
{
  "rewrites": [
    { "source": "/.well-known/mcp/server-card.json", "destination": "/api/gateway" },
    { "source": "/api/gateway", "destination": "/api/gateway" },
    { "source": "/api", "destination": "/api/index" }
  ]
}
```

This ensures:
- `.well-known` endpoints are discoverable
- `/api/gateway` routes directly to gateway handler
- `/api` falls back to index handler

### Environment Variables

```bash
# No environment variables required for basic operation
# Optional for production:
VERCEL_ENV=production
BASE_RPC_URL=https://mainnet.base.org
PAYMENT_WALLET=0xCD339078D159404D29000A6716D962C8833ABfe8
```

## Testing

### Local Testing

```bash
# Start the M2M handshake
node m2m_onboarder.js

# Run autonomous agent
node autonomous_agent.js

# Test individual endpoints
curl -X POST https://agent-services-seven.vercel.app/api/gateway \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "id": 1
  }'
```

### Testing Paid Methods

```bash
curl -X POST https://agent-services-seven.vercel.app/api/gateway \
  -H "Content-Type: application/json" \
  -H "payment-signature: 0x..." \
  -d '{
    "jsonrpc": "2.0",
    "method": "wallet_screen_snapshot",
    "params": {
      "targetAddress": "0xcd339078d159404d29000a6716d962c8833abfe8"
    },
    "id": 1
  }'
```

## Security Considerations

1. **Payment Signature Validation**
   - All paid methods require cryptographic signature
   - Signatures are validated against expected format
   - Signature hash is stored for dispute resolution

2. **CORS Headers**
   - Allows external agents to call gateway
   - Restricted to necessary methods and headers
   - Preflight requests cached for performance

3. **Input Validation**
   - Ethereum addresses validated with ethers.js
   - Transaction hashes verified with regex
   - JSON Schema validation on all inputs

4. **Rate Limiting** (Recommended Future)
   - Implement per-agent rate limits
   - Use x-request-id for idempotency
   - Track payment verification per signature

## Monitoring

### Key Metrics

- Requests per method
- Payment signature verification success rate
- Response times per tool
- Error rates by code
- Settlement success rate

### Logging

The gateway logs:

```
[INIT] Agent {agentId} initializing protocol version {version}
[DISCOVERY] Tool list requested. Returning {count} tools.
[SCREEN] Agent {agentId} screening {address} ({method})
[DECODE] Agent {agentId} decoding {txHash}
[RISK] Agent {agentId} analyzing {address}
```

## Future Enhancements

1. **Streaming Responses**
   - Server-Sent Events (SSE) for long-running operations
   - WebSocket support for real-time updates

2. **Advanced Payment Models**
   - Subscription-based pricing
   - Volume discounts
   - Free tier with rate limiting

3. **Agent Authentication**
   - OAuth 2.0 integration
   - API key management
   - Agent reputation scoring

4. **Analytics Dashboard**
   - Real-time request tracking
   - Payment settlement status
   - Agent usage statistics

## References

- JSON-RPC 2.0 Specification: https://www.jsonrpc.org/specification
- OpenAPI 3.0: https://spec.openapis.org/oas/v3.0.3
- Model Context Protocol: https://modelcontextprotocol.io/
- Vercel Serverless Functions: https://vercel.com/docs/functions
