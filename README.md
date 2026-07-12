# Base MCP Resolver - Machine-to-Machine Commerce Gateway

Autonomous Model Context Protocol (MCP) server providing machine-to-machine commerce layer for transaction analysis on Base mainnet.

## Protocol Parameters

* **Transport:** HTTP + JSON-RPC 2.0
* **Gateway Endpoint:** https://agent-services-seven.vercel.app/api/gateway
* **Discovery Schema:** https://agent-services-seven.vercel.app/.well-known/mcp/server-card.json
* **OpenAPI Spec:** https://agent-services-seven.vercel.app/openapi.json
* **Pricing Model:** Pay-per-call (1000 USDC per query)
* **Settlement Network:** Base mainnet (USDC)

## Autonomous Discovery Flow

External agentic actors can now autonomously discover and integrate with this service:

### Step 1: Service Discovery
```bash
curl https://agent-services-seven.vercel.app/.well-known/mcp/server-card.json
```

Response contains:
- Service metadata and version
- Transport and gateway URL
- Available methods
- Pricing model and payment wallet
- Discovery endpoints for tools, health, OpenAPI
- Agent routing guidance

### Step 2: Protocol Initialization
```javascript
const response = await fetch('https://agent-services-seven.vercel.app/api/gateway', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      clientInfo: { name: 'your-agent', version: '1.0.0' }
    },
    id: 1
  })
});
```

### Step 3: Tool Discovery
```bash
curl https://agent-services-seven.vercel.app/api/tools
```

Receive tool schemas with:
- Input/output validation schemas
- Cost per tool
- Timeout expectations
- Payment requirements

### Step 4: Method Invocation (with Payment)
```javascript
const response = await fetch('https://agent-services-seven.vercel.app/api/gateway', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'payment-signature': '0x...', // Cryptographic proof of payment
    'x-agent-id': 'agent-xyz-123'
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'wallet_screen_snapshot',
    params: {
      targetAddress: '0xcd339078d159404d29000a6716d962c8833abfe8',
      method: 'basic'
    },
    id: 2
  })
});
```

## Capabilities

### Free Methods (No Payment Required)
- `initialize`: Protocol handshake validation
- `tools/list`: Exposes active analytical tools for autonomous routing agents

### Paid Methods (Payment Required)
- `wallet_screen_snapshot`: **1000 USDC** - Analyze wallet for compliance and risk
- `transaction_decode`: **500 USDC** - Decode transaction data and extract execution details
- `address_risk_analysis`: **750 USDC** - Compute risk score based on transaction history

## Key Features

✅ **Autonomous Discovery** - Agents automatically find and integrate via `.well-known/mcp/server-card.json`

✅ **JSON-RPC 2.0 Protocol** - Standard machine-to-machine communication

✅ **Payment-Gated Access** - Cryptographic signature verification for paid methods

✅ **CORS-Enabled** - External agents can call from any origin

✅ **Tool Schemas** - Full JSON Schema definitions for agent routing

✅ **OpenAPI 3.0** - Complete REST/RPC hybrid specification

✅ **Health Checks** - Service status endpoint for agent monitoring

✅ **Request Tracking** - Agent ID and request ID headers for monitoring

## API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|----------|
| `/.well-known/mcp/server-card.json` | GET | None | Service discovery |
| `/api/gateway` | POST | payment-signature | Primary M2M gateway |
| `/api/health` | GET | None | Health check |
| `/api/tools` | GET | None | Tool schema discovery |
| `/openapi.json` | GET | None | OpenAPI specification |
| `/ai-plugin.json` | GET | None | AI plugin manifest |

## Error Handling

### HTTP Status Codes

| Code | Meaning | Recovery |
|------|---------|----------|
| 200 | Success | Request completed |
| 400 | Bad request | Check JSON-RPC format |
| 402 | Payment required | Provide `payment-signature` header |
| 500 | Server error | Retry with exponential backoff |

### JSON-RPC Error Codes

| Code | Meaning |
|------|----------|
| -32600 | Invalid Request |
| -32601 | Method not found |
| -32602 | Invalid params |
| -32603 | Internal error |
| -32001 | Payment required |

## Integration Example

```javascript
// Autonomous agent integration
class BaseTransactionAgent {
  async discover() {
    const discovery = await fetch(
      'https://agent-services-seven.vercel.app/.well-known/mcp/server-card.json'
    ).then(r => r.json());
    
    console.log(`Discovered: ${discovery.name}`);
    console.log(`Gateway: ${discovery.transport.url}`);
    console.log(`Available tools: ${discovery.methods.join(', ')}`);
    
    return discovery;
  }

  async initialize(discovery) {
    const res = await fetch(discovery.transport.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialize',
        params: { protocolVersion: '2024-11-05', clientInfo: { name: 'agent' } },
        id: 1
      })
    });
    return res.json();
  }

  async callTool(method, params, paymentSignature) {
    const res = await fetch(
      'https://agent-services-seven.vercel.app/api/gateway',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'payment-signature': paymentSignature
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method,
          params,
          id: Date.now()
        })
      }
    );
    return res.json();
  }
}

// Usage
const agent = new BaseTransactionAgent();
const discovery = await agent.discover();
const init = await agent.initialize(discovery);
const result = await agent.callTool(
  'wallet_screen_snapshot',
  { targetAddress: '0x...' },
  '0x...'
);
```

## Deployment

Deployed on Vercel with:
- Serverless functions for each endpoint
- Automatic CORS headers
- Static file serving for discovery endpoints
- Request caching for OpenAPI and plugin manifests

## Monitoring

Check service status:
```bash
curl https://agent-services-seven.vercel.app/api/health
```

## Security

- Payment signatures validated for all paid methods
- CORS restricted to necessary headers
- All inputs validated against JSON Schema
- Ethereum addresses validated with ethers.js
- Transaction hashes verified with regex

## Support

For questions or issues, contact: support@agent-services.io
