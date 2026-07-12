const { Coinbase, ExternalAddress } = require("@coinbase/coinbase-sdk");
require('dotenv').config();

Coinbase.configure({
    apiKeyName: process.env.CDP_API_KEY_NAME,
    privateKey: process.env.CDP_API_PRIVATE_KEY
});

async function cdpPaymentGuard(req, res, next) {
    const transferId = req.headers['x-cdp-transfer-id'];
    
    if (!transferId) {
        return res.status(401).json({ error: 'Missing CDP transfer ID' });
    }

    try {
        const externalAddress = new ExternalAddress(process.env.ISOLATED_WALLET_ADDRESS);
        const transfers = await externalAddress.listTransfers();
        
        const validTransfer = transfers.data.find(t => 
            t.id === transferId && 
            t.status === 'success' && 
            t.asset === 'usdc'
        );

        if (!validTransfer) {
            return res.status(403).json({ error: 'CDP payment flow settlement failed or missing' });
        }

        const actualAmount = BigInt(validTransfer.amount);
        const requiredAmount = BigInt(process.env.REQUIRED_USDC_AMOUNT || 10000);

        if (actualAmount < requiredAmount) {
            return res.status(403).json({ error: 'Insufficient payment amount settled' });
        }

        req.buyerAddress = validTransfer.networkAddress;
        next();
    } catch (error) {
        return res.status(500).json({ error: 'Internal CDP facilitator failure' });
    }
}

module.exports = { cdpPaymentGuard };
