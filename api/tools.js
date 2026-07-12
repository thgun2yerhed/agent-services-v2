import { TOOL_SCHEMAS } from './tools-schema.js';

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const tools = Object.entries(TOOL_SCHEMAS).map(([id, schema]) => ({
    id,
    name: schema.name,
    description: schema.description,
    inputSchema: schema.inputSchema,
    cost: schema.cost,
    timeout: schema.timeout,
    requiresPayment: schema.requiresPayment
  }));

  res.json({
    tools,
    count: tools.length,
    timestamp: new Date().toISOString()
  });
}