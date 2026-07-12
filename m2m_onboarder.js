const GATEWAY_URL = "https://agent-services-seven.vercel.app/api/gateway";

async function fireMachineHandshake() {
  console.log(`[M2M] Initializing autonomous protocol handshake -> ${GATEWAY_URL}`);
  
  try {
    // Step 1: Machine Initialization Request
    const initResponse = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          clientInfo: { name: "m2m-onboarding-bot", version: "1.0.0" }
        },
        id: Date.now()
      })
    });
    const initData = await initResponse.json();
    console.log("[M2M] Handshake Accepted:", JSON.stringify(initData.result?.serverInfo || initData));

    // Step 2: Machine Schema Discovery Scan
    const listResponse = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/list",
        id: Date.now() + 1
      })
    });
    const listData = await listResponse.json();
    console.log(`[M2M] Discovery Cached. Tools Found: ${listData.result?.tools?.length || 0}`);

  } catch (error) {
    console.error("[M2M_ERROR] Connection failure:", error.message);
  }
}

// Continuous machine execution loop matching your Array Six timing
async function startLoop() {
  while (true) {
    await fireMachineHandshake();
    await new Promise(resolve => setTimeout(resolve, 60000));
  }
}

startLoop();
