import { ethers } from "ethers";
import { processArraySixTarget } from "./array_six_loop.js";

async function deployNode(nodeId, targetAddress, provider) {
  console.log(`[NODE_${nodeId}] Booting execution sequence...`);
  const block = await provider.getBlock("latest", true);
  const liveTxHash = block.prefetchedTransactions[nodeId].hash;
  
  const isCompliant = await processArraySixTarget(targetAddress, liveTxHash);
  
  if (isCompliant) {
     console.log(`[NODE_${nodeId}] Target locked and approved. Payload executing.`);
  } else {
     console.log(`[NODE_${nodeId}] Target rejected. Discontinuing.`);
  }
}

async function launchArraySix() {
  const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
  const targetAddress = "0xcd339078d159404d29000a6716d962c8833abfe8";
  
  console.log("[COMMAND] Launching Execution Array Six...");
  
  const nodeIdentifiers = [1, 2, 3, 4, 5];
  await Promise.all(nodeIdentifiers.map(id => deployNode(id, targetAddress, provider)));
  
  console.log("[COMMAND] Array Six deployment cycle complete.");
}

launchArraySix().catch(console.error);
