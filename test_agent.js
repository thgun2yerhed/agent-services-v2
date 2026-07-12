import { ethers } from "ethers";

const ORACLE_URL = "https://agent-services-hkcq7tjac-spin-strz.vercel.app/api";
const BASE_RPC = "https://mainnet.base.org";

class TestAgent {
  constructor(wallet) {
    this.wallet = wallet;
    this.provider = new ethers.JsonRpcProvider(BASE_RPC);
  }

  async getPaymentSignature() {
    const block = await this.provider.getBlock("latest", true);
    return block.prefetchedTransactions[0].hash;
  }

  async queryOracle(targetAddress) {
    const sig = await this.getPaymentSignature();
    
    const response = await fetch(ORACLE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "payment-signature": sig
      },
      body: JSON.stringify({
        method: "wallet_screen_snapshot",
        targetAddress: targetAddress
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Oracle failed: HTTP ${response.status}\n${errText}`);
    }

    return await response.json();
  }
}

async function runTestAgent() {
  const agent = new TestAgent("0xcd339078d159404d29000a6716d962c8833abfe8");
  
  console.log("[AGENT] Querying oracle...");
  const result = await agent.queryOracle("0xcd339078d159404d29000a6716d962c8833abfe8");
  
  console.log("[AGENT] Oracle response:");
  console.log(JSON.stringify(result, null, 2));
  console.log("[AGENT] Settlement recorded.");
}

runTestAgent().catch(console.error);
