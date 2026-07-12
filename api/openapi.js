export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  res.json({
    openapi: '3.0.0',
    info: {
      title: 'Base MCP Resolver - M2M Commerce Gateway',
      description: 'Machine-to-machine protocol gateway for autonomous transaction analysis on Base network. Exposes JSON-RPC 2.0 interface for agentic actors.',
      version: '2.0.0',
      contact: {
        name: 'Agent Services',
        email: 'support@agent-services.io',
        url: 'https://agent-services-seven.vercel.app'
      },
      license: {
        name: 'MIT'
      }
    },
    servers: [
      {
        url: 'https://agent-services-seven.vercel.app',
        description: 'Production gateway'
      }
    ],
    paths: {
      '/api/gateway': {
        post: {
          summary: 'Machine Context Protocol (MCP) Gateway',
          description: 'Primary entry point for M2M commerce requests using JSON-RPC 2.0 protocol',
          operationId: 'mcpGateway',
          tags: ['gateway'],
          parameters: [
            {
              name: 'payment-signature',
              in: 'header',
              description: 'Cryptographic signature for payment verification (required for paid methods)',
              required: false,
              schema: {
                type: 'string',
                pattern: '^0x[a-fA-F0-9]{64}$'
              }
            },
            {
              name: 'x-agent-id',
              in: 'header',
              description: 'Unique identifier for calling agent',
              required: false,
              schema: {
                type: 'string'
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    jsonrpc: { type: 'string', enum: ['2.0'] },
                    method: { type: 'string' },
                    params: { type: 'object' },
                    id: { type: ['string', 'number'] }
                  },
                  required: ['jsonrpc', 'method', 'id']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Successful JSON-RPC response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      jsonrpc: { type: 'string', enum: ['2.0'] },
                      result: { type: 'object' },
                      id: { type: ['string', 'number'] }
                    }
                  }
                }
              }
            },
            '402': {
              description: 'Payment required - missing or invalid payment signature'
            },
            '400': {
              description: 'Bad request - invalid JSON-RPC'
            },
            '500': {
              description: 'Internal server error'
            }
          }
        }
      },
      '/api/health': {
        get: {
          summary: 'Health Check',
          description: 'Check service operational status',
          operationId: 'healthCheck',
          tags: ['system'],
          responses: {
            '200': {
              description: 'Service is operational'
            }
          }
        }
      },
      '/api/tools': {
        get: {
          summary: 'List Tools',
          description: 'Retrieve available tools and their schemas for agent routing',
          operationId: 'listTools',
          tags: ['discovery'],
          responses: {
            '200': {
              description: 'Tool list with schemas'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'gateway',
        description: 'Core MCP gateway endpoints'
      },
      {
        name: 'discovery',
        description: 'Tool and service discovery'
      },
      {
        name: 'system',
        description: 'System and health endpoints'
      }
    ]
  });
}
