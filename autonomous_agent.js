import { ethers } from "ethers";

const ORACLE_URL = "https://agent-services-seven.vercel.app/api";
const BASE_RPC = "https://mainnet.base.org";

const TEST_ADDRESSES = [
  "0xcd339078d159404d29000a6716d962c8833abfe8",
  "0x1234567890123456789012345678901234567890",
  "0x0000000000000000000000000000000000000000"
];

async function queryOracle(address) {
  const provider = new ethers.JsonRpcProvider(BASE_RPC);
  const block = await provider.getBlock("latest", true);
  const sig = block.prefetchedTransactions[0].hash;

  const response = await fetch(ORACLE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "payment-signature": sig
    },
    body: JSON.stringify({
      method: "wallet_screen_snapshot",
      targetAddress: address
    })
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  console.log(`[${new Date().toISOString()}] Screened ${address}: verified=${data.paymentVerified}`);
  return data;
}

async function autonomousAgent() {
  for (const addr of TEST_ADDRESSES) {
    try {
      await queryOracle(addr);
    } catch (error) {
      console.error(`Failed: ${addr}`, error.message);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}

setInterval(autonomousAgent, 5 * 60 * 1000);
autonomousAgent();
