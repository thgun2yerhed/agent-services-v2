export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  res.json({
    id: 'io.vercel.agent-services',
    name: 'Base Transaction Resolver',
    description: 'Machine-to-machine commerce gateway for autonomous transaction analysis on Base network',
    version: '2.0.0',
    transport: {
      type: 'http',
      url: 'https://agent-services-seven.vercel.app/api/gateway'
    },
    capabilities: {
      tools: true,
      streaming: false,
      authentication: 'payment-signature'
    },
    methods: [
      'initialize',
      'tools/list',
      'wallet_screen_snapshot',
      'transaction_decode',
      'address_risk_analysis'
    ],
    discovery: {
      tools_endpoint: 'https://agent-services-seven.vercel.app/api/tools',
      health_endpoint: 'https://agent-services-seven.vercel.app/api/health',
      openapi_endpoint: 'https://agent-services-seven.vercel.app/openapi.json',
      ai_plugin_endpoint: 'https://agent-services-seven.vercel.app/ai-plugin.json'
    },
    pricing: {
      model: 'pay-per-call',
      currency: 'USDC',
      network: 'Base',
      wallet: '0xCD339078D159404D29000A6716D962C8833ABfe8',
      payment_signature_header: 'payment-signature'
    },
    metadata: {
      contact: 'support@agent-services.io',
      documentation: 'https://agent-services-seven.vercel.app/docs',
      status: 'production',
      uptime_sla: '99.9%',
      autonomous_discovery: true,
      requires_auth: true
    },
    agent_routing: {
      free_methods: ['initialize', 'tools/list', '/.well-known/discover'],
      paid_methods: ['wallet_screen_snapshot', 'transaction_decode', 'address_risk_analysis'],
      discovery_order: [
        '1. Fetch /.well-known/mcp/server-card.json for server metadata',
        '2. Call initialize method to validate protocol compatibility',
        '3. Fetch /api/tools or call tools/list for available tools',
        '4. Read tool schemas to understand inputs/outputs',
        '5. Route requests to appropriate methods with payment signature'
      ]
    }
  });
}
