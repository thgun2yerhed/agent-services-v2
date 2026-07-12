import { ethers } from "ethers";
import fs from "fs";
import path from "path";

const SETTLEMENT_LOG = "./settlements.json";
const PAYMENT_CONFIG = {
  network: "Base",
  asset: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  amount: "1000",
  payTo: "0xCD339078D159404D29000A6716D962C8833ABfe8"
};

function initSettlementLog() {
  if (!fs.existsSync(SETTLEMENT_LOG)) {
    fs.writeFileSync(SETTLEMENT_LOG, JSON.stringify({ settlements: [], total: 0 }, null, 2));
  }
}

export function verifyPayment(signature, targetAddress) {
  if (!signature) {
    return { valid: false, error: "Missing payment-signature header" };
  }
  
  if (!/^0x[a-fA-F0-9]{64}$/.test(signature)) {
    return { valid: false, error: "Invalid signature format" };
  }
  
  return { valid: true, signature, targetAddress };
}

export function settlePayment(signature, targetAddress, result) {
  initSettlementLog();
  
  const settlement = {
    id: ethers.id(signature),
    timestamp: new Date().toISOString(),
    signature,
    targetAddress,
    paymentConfig: PAYMENT_CONFIG,
    result,
    settled: true
  };
  
  const log = JSON.parse(fs.readFileSync(SETTLEMENT_LOG, "utf8"));
  log.settlements.push(settlement);
  log.total += 1;
  
  fs.writeFileSync(SETTLEMENT_LOG, JSON.stringify(log, null, 2));
  
  return settlement;
}

export function getSettlementStatus(signature) {
  if (!fs.existsSync(SETTLEMENT_LOG)) {
    return { settled: false, error: "No settlements recorded" };
  }
  
  const log = JSON.parse(fs.readFileSync(SETTLEMENT_LOG, "utf8"));
  const settlement = log.settlements.find(s => s.signature === signature);
  
  return settlement || { settled: false, signature };
}
