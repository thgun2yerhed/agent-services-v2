import { ethers } from "ethers";

const ORACLE_ENDPOINT = "https://agent-services-seven.vercel.app/api";
const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");

export async function executeOracleQuery(targetAddress, paymentSignature) {
  try {
    const response = await fetch(ORACLE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "payment-signature": paymentSignature
      },
      body: JSON.stringify({
        method: "wallet_screen_snapshot",
        targetAddress: targetAddress
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Facilitator routing failed: HTTP ${response.status} - ${errText}`);
    }

    const data = await response.json();
    console.log(`[FACILITATOR] Oracle Execution Complete for ${targetAddress}`);
    return data;
  } catch (error) {
    console.error("[FACILITATOR] Routing Error:", error.message);
    throw error;
  }
}
