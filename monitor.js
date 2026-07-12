import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");

console.log("[ACTIVE] Initializing Base Mainnet Live Stream Engine...");
console.log("[LOGGING] Extracting high-velocity autonomous activity and contract factory deployments...");

provider.on("block", async (blockNumber) => {
  try {
    const block = await provider.getBlock(blockNumber, true);
    if (!block || !block.prefetchedTransactions) return;

    for (const tx of block.prefetchedTransactions) {
      // Identity check for raw smart contract creation deployments
      if (!tx.to) {
        const receipt = await provider.getTransactionReceipt(tx.hash);
        if (receipt && receipt.contractAddress) {
          console.log(`[NEW_DEPLOYMENT] Factory: ${tx.from} | Contract: ${receipt.contractAddress} | Block: ${blockNumber}`);
        }
      } 
      // Scan transaction data strings for high-frequency routing and execution signatures
      else if (tx.data && tx.data.length > 10) {
        const methodId = tx.data.slice(0, 10);
        
        // Target automated swap executions (0x3593564c) and multicall routers (0xac9650d8)
        if (methodId === "0x3593564c" || methodId === "0xac9650d8") {
          console.log(`[AGENT_MATCH] Origin Wallet: ${tx.from} | Target Contract: ${tx.to} | Method: ${methodId}`);
        }
      }
    }
  } catch (error) {
    console.error(`[STREAM ERROR] Failed to parse block height ${blockNumber}:`, error.message);
  }
});

process.on("SIGINT", () => {
  console.log("\n[SHUTDOWN] Terminating blockchain live stream tracker.");
  process.exit(0);
});
