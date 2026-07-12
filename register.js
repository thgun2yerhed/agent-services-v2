import 'dotenv/config';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0x31B1a649d3D1BD5dc623Faf4524Bb2D9c5335734";
const ABI = ["function register(string memory name, string memory metadata) external"];

async function registerNode() {
  // Use .trim() to remove hidden newlines or spaces
  const rawKey = process.env.PRIVATE_KEY?.trim();
  
  if (!rawKey) {
    throw new Error("PRIVATE_KEY is missing.");
  }

  const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC || "https://mainnet.base.org");
  
  try {
    const wallet = new ethers.Wallet(rawKey, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    console.log("Registering node...");
    const tx = await contract.register("AgentNode", "https://your-node-docs.com");
    await tx.wait();
    console.log("Registered successfully.");
  } catch (err) {
    console.error("Wallet creation failed:", err.message);
    process.exit(1);
  }
}

registerNode();
