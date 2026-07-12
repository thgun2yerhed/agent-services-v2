// Machine-consumable tool schema definitions for agent routing
export const TOOL_SCHEMAS = {
  wallet_screen_snapshot: {
    name: 'Screen Wallet',
    description: 'Analyze wallet address for compliance, transaction patterns, and risk profile on Base network',
    inputSchema: {
      type: 'object',
      properties: {
        targetAddress: {
          type: 'string',
          pattern: '^0x[a-fA-F0-9]{40}$',
          description: 'Ethereum address (Base network)'
        },
        method: {
          type: 'string',
          enum: ['basic', 'deep', 'legacy'],
          default: 'basic',
          description: 'Analysis depth level'
        }
      },
      required: ['targetAddress']
    },
    cost: '1000 USDC',
    requiresPayment: true,
    timeout: '30s',
    outputs: {
      type: 'object',
      properties: {
        address: { type: 'string' },
        screened: { type: 'boolean' },
        riskLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  },
  transaction_decode: {
    name: 'Decode Transaction',
    description: 'Decode transaction data and extract method signature, parameters, and execution details',
    inputSchema: {
      type: 'object',
      properties: {
        txHash: {
          type: 'string',
          pattern: '^0x[a-fA-F0-9]{64}$',
          description: 'Transaction hash on Base network'
        }
      },
      required: ['txHash']
    },
    cost: '500 USDC',
    requiresPayment: true,
    timeout: '20s',
    outputs: {
      type: 'object',
      properties: {
        txHash: { type: 'string' },
        decoded: { type: 'boolean' },
        method: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  },
  address_risk_analysis: {
    name: 'Analyze Address Risk',
    description: 'Compute risk score and factors for an address based on transaction history and account age',
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          pattern: '^0x[a-fA-F0-9]{40}$',
          description: 'Address to analyze'
        }
      },
      required: ['address']
    },
    cost: '750 USDC',
    requiresPayment: true,
    timeout: '25s',
    outputs: {
      type: 'object',
      properties: {
        address: { type: 'string' },
        riskScore: { type: 'number', minimum: 0, maximum: 1 },
        riskLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  },
  initialize: {
    name: 'Initialize Protocol',
    description: 'Perform machine-to-machine protocol handshake and validate compatibility',
    inputSchema: {
      type: 'object',
      properties: {
        protocolVersion: {
          type: 'string',
          description: 'MCP protocol version (e.g., 2024-11-05)'
        },
        clientInfo: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            version: { type: 'string' }
          }
        }
      }
    },
    cost: 'free',
    requiresPayment: false,
    timeout: '10s',
    outputs: {
      type: 'object',
      properties: {
        serverInfo: { type: 'object' },
        ready: { type: 'boolean' }
      }
    }
  },
  'tools/list': {
    name: 'List Available Tools',
    description: 'Discover and retrieve all available tools and their schemas',
    inputSchema: {
      type: 'object',
      properties: {
        filter: {
          type: 'string',
          description: 'Filter tools by category'
        }
      }
    },
    cost: 'free',
    requiresPayment: false,
    timeout: '5s',
    outputs: {
      type: 'object',
      properties: {
        tools: { type: 'array' },
        count: { type: 'integer' }
      }
    }
  }
};