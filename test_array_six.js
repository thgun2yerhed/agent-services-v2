import { ethers } from "ethers";
import { processArraySixTarget } from "./array_six_loop.js";

async function executeLiveNodeTest() {
  console.log("[ARRAY_6_TEST] Connecting to Base Mainnet...");
  const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
  
  console.log("[ARRAY_6_TEST] Fetching live ledger data...");
  const block = await provider.getBlock("latest", true);
  const liveTxHash = block.prefetchedTransactions[0].hash;
  const targetAddress = "0xcd339078d159404d29000a6716d962c8833abfe8";

  console.log(`[ARRAY_6_TEST] Injecting target ${targetAddress} with signature ${liveTxHash}`);
  
  const isCompliant = await processArraySixTarget(targetAddress, liveTxHash);
  
  console.log(`[ARRAY_6_TEST] Final Execution Status: ${isCompliant ? "APPROVED" : "DENIED"}`);
}

executeLiveNodeTest().catch(console.error);
