import { ethers } from "ethers";

const BASE_RPC = "https://mainnet.base.org";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  try {
    let body = '';
    await new Promise((resolve) => {
      req.on('data', chunk => { body += chunk; });
      req.on('end', resolve);
    });

    const payload = JSON.parse(body || '{}');
    const targetAddress = payload.targetAddress || payload.address || payload.target;

    if (!targetAddress || !targetAddress.startsWith('0x') || targetAddress.length !== 42) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Valid target hex address required' }));
    }

    // Initialize real connection to Base network
    const provider = new ethers.JsonRpcProvider(BASE_RPC);
    
    // Mechanical Extraction: Pull authentic live on-chain metrics
    const [balance, txCount, code] = await Promise.all([
      provider.getBalance(targetAddress),
      provider.getTransactionCount(targetAddress),
      provider.getCode(targetAddress)
    ]);

    // Format metrics into a verifiable service payload
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      protocol: "ACP-2026",
      service_offering: "wallet_screen_snapshot",
      target: targetAddress,
      metrics: {
        native_balance_eth: ethers.formatEther(balance),
        total_transactions_sent: txCount,
        is_smart_contract: code !== "0x",
        bytecode_size_bytes: code === "0x" ? 0 : (code.length - 2) / 2
      },
      timestamp: Date.now()
    }));

  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: error.message }));
  }
}
