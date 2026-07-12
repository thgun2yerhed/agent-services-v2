import { ethers } from "ethers";
import { executeOracleQuery } from "./custom_facilitator.js";

async function verifyFacilitator() {
  console.log("[INIT] Connecting to Base Mainnet...");
  const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
  
  console.log("[FETCH] Retrieving latest block data...");
  const block = await provider.getBlock("latest", true);
  const liveTxHash = block.prefetchedTransactions[0].hash;
  
  const targetAddress = "0xcd339078d159404d29000a6716d962c8833abfe8";

  console.log(`[EXECUTE] Routing via custom facilitator targeting agent.services...`);
  console.log(`- Target Address: ${targetAddress}`);
  console.log(`- Live Payment Signature: ${liveTxHash}`);

  const result = await executeOracleQuery(targetAddress, liveTxHash);
  
  console.log("\n=== FACILITATOR ROUTING RESULT ===");
  console.log(JSON.stringify(result, null, 2));
  console.log("==================================");
}

verifyFacilitator().catch(console.error);
