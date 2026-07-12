import { ethers } from "ethers";

const walletAddress = process.env.AGENT_SIGNER_ADDRESS || "0x0000000000000000000000000000000000000000";
const rpcUrl = process.env.BASE_RPC_URL || "https://mainnet.base.org";

export default async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, payment-signature");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({
      mcpId: "base-mcp-resolver",
      name: "Agentik Signal Service (Free Tier)",
      version: "2.0.0",
      description: "Free MCP wrapper over public APIs",
      x402Version: 2,
      extensions: {
        bazaar: {
          discoverable: true,
          resource: "https://agent-services-seven.vercel.app/api/gateway",
          type: "mcp",
          description: "Free onboarding tool providing authentic live transaction analysis on Base mainnet."
        }
      },
      endpoints: {
        schema: "/.well-known/mcp/server-card.json",
        rpc: "POST to this URL with JSON-RPC"
      }
    }));
  }

  if (req.method === "POST") {
    try {
      let body = '';
      await new Promise((resolve) => {
        req.on('data', chunk => { body += chunk; });
        req.on('end', resolve);
      });

      const payload = JSON.parse(body || '{}');
      const { method, params, id } = payload;

      if (method === "initialize") {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({
          jsonrpc: "2.0",
          id: id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: { name: "base-mcp-resolver", version: "2.0.0" }
          }
        }));
      }

      if (method === "tools/list") {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({
          jsonrpc: "2.0",
          id: id,
          result: {
            tools: [{
              name: "resolve_transaction",
              description: "Queries the Base blockchain via RPC to fetch authentic execution data. Free signal feed.",
              inputSchema: {
                type: "object",
                properties: { txHash: { type: "string" } },
                required: ["txHash"]
              }
            }]
          }
        }));
      }

      if (method === "tools/call" && params?.name === "resolve_transaction" && params?.arguments?.txHash) {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        try {
          const tx = await provider.getTransaction(params.arguments.txHash);
          if (!tx) {
            res.writeHead(200, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({
              jsonrpc: "2.0",
              id: id,
              result: { content: [{ type: "text", text: "Transaction not found." }], isError: true }
            }));
          }

          const resolutionText = JSON.stringify({
            status: "SUCCESS",
            serviceAddress: walletAddress,
            transactionHash: params.arguments.txHash,
            blockNumber: tx.blockNumber,
            from: tx.from,
            to: tx.to,
            value: tx.value.toString(),
            timestamp: new Date().toISOString()
          }, null, 2);

          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({
            jsonrpc: "2.0",
            id: id,
            result: { content: [{ type: "text", text: resolutionText }] }
          }));
        } catch (rpcErr) {
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({
            jsonrpc: "2.0",
            id: id,
            result: { content: [{ type: "text", text: `RPC error: ${rpcErr.message}` }], isError: true }
          }));
        }
      }

      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({
        jsonrpc: "2.0",
        id: id || null,
        error: { code: -32601, message: "Method not found" }
      }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32700, message: "Parse error" }
      }));
    }
  }

  res.writeHead(404);
  return res.end();
};
