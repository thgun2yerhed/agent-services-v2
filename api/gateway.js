import { ethers } from "ethers";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req, res) => {
  const walletAddress = process.env.AGENT_SIGNER_ADDRESS || process.env.WALLET_ADDRESS || "";
  const rpcUrl = process.env.BASE_RPC_URL || process.env.BASE_RPC || "https://mainnet.base.org";
  const host = req.headers.host || "";
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const resourceUrl = host ? `${protocol}://${host}/api/gateway` : "";

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, payment-signature, x-402-version");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({
      mcpId: "base-mcp-resolver",
      name: "Agentik Signal Service",
      version: "2.0.0",
      description: "MCP wrapper over public APIs",
      x402Version: 2,
      extensions: {
        bazaar: {
          discoverable: true,
          resource: resourceUrl,
          type: "mcp",
          description: "Onboarding tool providing authentic live transaction analysis on Base mainnet."
        }
      },
      endpoints: {
        schema: "/.well-known/mcp/server-card.json",
        rpc: "POST to this URL with JSON-RPC"
      }
    }));
  }

  const sendX402Details = () => {
    const x402Specs = {
      x402Version: "2.0.0",
      accepts: [{
        shape: "single",
        scheme: "exact",
        network: "eip155:8453",
        asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bda02913",
        amount: "0",
        payTo: walletAddress,
        maxTimeoutSeconds: 300
      }],
      resource: resourceUrl,
      bazaar: {
        info: {
          input: { type: "json-rpc", method: "resolve_transaction" },
          output: { example: "SUCCESS" }
        },
        schema: {
          type: "object",
          properties: { txHash: { type: "string" } }
        }
      }
    };
    
    res.writeHead(402, { 
      "Content-Type": "application/json",
      "X-402-Version": "2.0.0"
    });
    return res.end(JSON.stringify(x402Specs));
  };

  if (req.method === "POST") {
    let body = "";
    try {
      await new Promise((resolve, reject) => {
        req.on("data", (chunk) => { body += chunk; });
        req.on("end", resolve);
        req.on("error", reject);
      });
    } catch (e) {
      return sendX402Details();
    }

    let payload = {};
    if (body) {
      try {
        payload = JSON.parse(body);
      } catch (e) {
        return sendX402Details();
      }
    } else {
      return sendX402Details();
    }

    const { method, params, id } = payload;

    if (method === "initialize") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({
        jsonrpc: "2.0",
        id: id || null,
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
        id: id || null,
        result: {
          tools: [{
            name: "resolve_transaction",
            description: "Queries the Base blockchain via RPC to fetch authentic execution data.",
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
            id: id || null,
            result: { content: [{ type: "text", text: "Transaction not found." }], isError: true }
          }));
        }

        const resolutionText = JSON.stringify({
          status: "SUCCESS",
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
          id: id || null,
          result: { content: [{ type: "text", text: resolutionText }] }
        }));
      } catch (rpcErr) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({
          jsonrpc: "2.0",
          id: id || null,
          result: { content: [{ type: "text", text: `RPC error: ${rpcErr.message}` }], isError: true }
        }));
      }
    }

    return sendX402Details();
  }

  res.writeHead(404);
  return res.end();
};
