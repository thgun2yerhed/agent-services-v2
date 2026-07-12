async function pingOnyxIndex() {
  console.log("[BROADCAST] Announcing free tier routing parameters to Onyx Bazaar aggregation nodes...");
  
  const payload = {
    resource: "https://agent-services-seven.vercel.app/api/gateway",
    status: "active",
    pricing: {
      type: "x402-free",
      costPerCall: "0.00",
      asset: "USDC",
      network: "base-mainnet"
    },
    serverCard: "https://agent-services-seven.vercel.app/.well-known/mcp/server-card.json"
  };

  try {
    const response = await fetch("https://onyxbazaar.com/api/bazaar/ping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      console.log("[SUCCESS] Free-tier parameters recorded by Onyx aggregator.");
    } else {
      console.log(`[INFO] Status ping delivered. Gateway code: ${response.status}`);
    }
  } catch (err) {
    console.error("[ERROR] Programmatic broadcast connection dropped:", err.message);
  }
}

pingOnyxIndex();
