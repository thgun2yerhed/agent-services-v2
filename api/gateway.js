import { verifyPayment, settlePayment, getSettlementStatus } from '../facilitator.js';
import { TOOL_SCHEMAS } from './tools-schema.js';
import { ethers } from 'ethers';

// Enable CORS for machine clients
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, payment-signature, x-agent-id, x-request-id');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Content-Type', 'application/json');
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed', method: req.method });
    return;
  }

  try {
    const body = req.body || {};
    const paymentSignature = req.headers['payment-signature'];
    const agentId = req.headers['x-agent-id'] || 'unknown-agent';
    const requestId = req.headers['x-request-id'] || Date.now().toString();

    // JSON-RPC 2.0 routing
    const { jsonrpc = '2.0', method, params = {}, id } = body;

    if (!method) {
      return res.status(400).json({
        jsonrpc,
        error: { code: -32700, message: 'Parse error: method is required' },
        id
      });
    }

    let result;

    // Public methods (no payment required)
    if (method === 'initialize') {
      result = handleInitialize(params, agentId);
    } else if (method === 'tools/list') {
      result = handleToolsList(params);
    } else if (method === '/.well-known/discover') {
      result = handleDiscover(params);
    }
    // Protected methods (payment required)
    else if (['wallet_screen_snapshot', 'transaction_decode', 'address_risk_analysis'].includes(method)) {
      // Verify payment signature
      const verification = verifyPayment(paymentSignature, params.targetAddress);
      if (!verification.valid) {
        return res.status(402).json({
          jsonrpc,
          error: { code: -32001, message: verification.error, requiresPayment: true },
          id
        });
      }

      // Route to appropriate handler
      if (method === 'wallet_screen_snapshot') {
        result = await handleWalletScreen(params, paymentSignature, agentId, requestId);
      } else if (method === 'transaction_decode') {
        result = await handleTransactionDecode(params, paymentSignature, agentId, requestId);
      } else if (method === 'address_risk_analysis') {
        result = await handleAddressRiskAnalysis(params, paymentSignature, agentId, requestId);
      }

      // Settle payment
      settlePayment(paymentSignature, params.targetAddress, { method, result });
    } else {
      return res.status(400).json({
        jsonrpc,
        error: { code: -32601, message: 'Method not found', method },
        id
      });
    }

    return res.status(200).json({
      jsonrpc,
      result,
      id
    });
  } catch (error) {
    console.error('[GATEWAY_ERROR]', error);
    res.status(500).json({
      jsonrpc: '2.0',
      error: { code: -32603, message: 'Internal server error', details: error.message }
    });
  }
}

function handleInitialize(params, agentId) {
  console.log(`[INIT] Agent ${agentId} initializing protocol version ${params.protocolVersion || 'unknown'}`);
  return {
    serverInfo: {
      name: 'base-mcp-resolver',
      version: '2.0.0',
      protocolVersion: '2024-11-05',
      ready: true,
      timestamp: new Date().toISOString(),
      capabilities: {
        tools: true,
        streaming: false,
        authentication: 'payment-signature'
      }
    }
  };
}

function handleToolsList(params) {
  const tools = Object.entries(TOOL_SCHEMAS).map(([id, schema]) => ({
    id,
    name: schema.name,
    description: schema.description,
    inputSchema: schema.inputSchema,
    cost: schema.cost,
    timeout: schema.timeout
  }));
  console.log(`[DISCOVERY] Tool list requested. Returning ${tools.length} tools.`);
  return { tools, count: tools.length };
}

function handleDiscover(params) {
  return {
    id: 'io.vercel.agent-services',
    name: 'Base Transaction Resolver',
    description: 'Machine-to-machine commerce gateway for Base network transaction analysis',
    version: '2.0.0',
    endpoints: {
      gateway: 'https://agent-services-seven.vercel.app/api/gateway',
      health: 'https://agent-services-seven.vercel.app/api/health',
      tools: 'https://agent-services-seven.vercel.app/api/tools',
      openapi: 'https://agent-services-seven.vercel.app/openapi.json'
    }
  };
}

async function handleWalletScreen(params, signature, agentId, requestId) {
  const { targetAddress, method: screenMethod = 'basic' } = params;

  if (!targetAddress || !ethers.isAddress(targetAddress)) {
    throw new Error('Invalid target address');
  }

  console.log(`[SCREEN] Agent ${agentId} screening ${targetAddress} (${screenMethod})`);

  // Placeholder implementation
  return {
    address: targetAddress,
    screened: true,
    riskLevel: 'low',
    timestamp: new Date().toISOString(),
    requestId,
    agentId
  };
}

async function handleTransactionDecode(params, signature, agentId, requestId) {
  const { txHash } = params;

  if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
    throw new Error('Invalid transaction hash');
  }

  console.log(`[DECODE] Agent ${agentId} decoding ${txHash}`);

  return {
    txHash,
    decoded: true,
    method: 'transfer',
    timestamp: new Date().toISOString(),
    requestId,
    agentId
  };
}

async function handleAddressRiskAnalysis(params, signature, agentId, requestId) {
  const { address } = params;

  if (!address || !ethers.isAddress(address)) {
    throw new Error('Invalid address');
  }

  console.log(`[RISK] Agent ${agentId} analyzing ${address}`);

  return {
    address,
    riskScore: 0.15,
    riskLevel: 'low',
    factors: ['transaction_count', 'age', 'token_balance'],
    timestamp: new Date().toISOString(),
    requestId,
    agentId
  };
}