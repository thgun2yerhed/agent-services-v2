import { createWalletClient, http } from 'viem';
import { mnemonicToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

const mnemonic = process.env.MNEMONIC;
const gatewayUrl = "https://agent-services-ruddy.vercel.app/";
const recipientNodeWallet = "0xcd339078d159404d29000a6716d962c8833abfe8";

async function executeMarketRegistration() {
  if (!mnemonic || mnemonic.trim() === "") {
    console.error("Execution Aborted: The MNEMONIC environment variable is empty or unset.");
    process.exit(1);
  }

  try {
    // Derive the account keys directly using standard Ethereum derivation paths
    const txSigner = mnemonicToAccount(mnemonic.trim());
    
    const client = createWalletClient({
      account: txSigner,
      chain: base,
      transport: http()
    });

    console.log(`[Base Mainnet] Derived Address: ${txSigner.address}`);
    console.log(`[Base Mainnet] Initiating registration settlement...`);

    const txHash = await client.sendTransaction({
      to: recipientNodeWallet,
      value: 500n
    });

    console.log(`[Onchain Confirmed] Settlement broadcast successful. TxHash: ${txHash}`);
    console.log("[Gateway Handshake] Dispatching verification headers to the live Vercel endpoint...");

    const response = await fetch(gatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "PAYMENT-SIGNATURE": txHash
      },
      body: JSON.stringify({ method: "gas_estimate_check" })
    });

    const bodyResult = await response.json();

    if (response.status === 200) {
      console.log("\n======================================================================");
      console.log("SUCCESS: Node metadata broadcast successfully to the market catalogs.");
      console.log("======================================================================");
      console.log(bodyResult);
    } else {
      console.error(`\n[Error] Gateway rejected verification check. Status: ${response.status}`);
      console.error(bodyResult);
    }

  } catch (err) {
    console.error(`\n[Execution Failure] Automation process failed: ${err.message}`);
  }
}

executeMarketRegistration();
