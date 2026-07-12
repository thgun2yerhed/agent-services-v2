async function runRegistration() {
  console.log("[BAM] Packaging machine tool schema definitions...");

  const metadataBlob = {
    x402Version: 2,
    resource: "https://agent-services-seven.vercel.app/api/gateway",
    type: "mcp",
    accepts: [
      {
        scheme: "exact",
        amount: "0",
        asset: "0x0000000000000000000000000000000000000000",
        network: "base-mainnet"
      }
    ],
    metadata: {
      name: "Agentik Signal Service (Free Tier)",
      description: "Free MCP utility tracking Base mainnet transaction activity for autonomous agent onboarding.",
      tools: [
        {
          name: "resolve_transaction",
          description: "Queries the Base blockchain via RPC to fetch authentic execution data. Free signal feed.",
          inputSchema: {
            type: "object",
            properties: {
              txHash: { type: "string", description: "The transaction hash to analyze on Base mainnet" }
            },
            required: ["txHash"]
          }
        }
      ]
    }
  };

  console.log("[BAM] Transmitting protocol schema directly to Coinbase Developer Hub Indexer...");

  try {
    const response = await fetch("https://api.cdp.coinbase.com/platform/v2/x402/settle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        paymentPayload: {
          resource: "https://agent-services-seven.vercel.app/api/gateway",
          method: "POST",
          extensions: {
            bazaar: metadataBlob
          }
        }
      })
    });

    const outputText = await response.text();
    console.log("[SUCCESS] Coinbase Facilitator Response Ingested:");
    console.log(outputText);
  } catch (error) {
    console.error("[ERROR] Registration broadcast failed:", error.message);
  }
}

runRegistration();
