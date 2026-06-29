import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Simple in-memory cache for token data
const tokenCache = {
  'USDC': { symbol: 'USDC', decimals: 6, chain: 'base', marketCap: '29000000000' },
  'WETH': { symbol: 'WETH', decimals: 18, chain: 'base', marketCap: '180000000000' },
  'BASE': { symbol: 'BASE', decimals: 18, chain: 'base', marketCap: '5000000000' },
  'VIRTUAL': { symbol: 'VIRTUAL', decimals: 18, chain: 'base', marketCap: '8000000000' }
};

// Service 1: Token Metadata Lookup ($0.02)
app.post('/api/services/token_metadata_lookup', (req, res) => {
  const { token_symbol } = req.body;

  if (!token_symbol) {
    return res.status(400).json({ error: 'token_symbol required' });
  }

  const token = tokenCache[token_symbol.toUpperCase()];
  
  if (!token) {
    return res.status(404).json({ 
      error: 'Token not found',
      searched: token_symbol 
    });
  }

  res.json({
    service: 'token_metadata_lookup',
    price: '$0.02',
    timestamp: new Date().toISOString(),
    data: {
      symbol: token.symbol,
      decimals: token.decimals,
      chain: token.chain,
      marketCap: token.marketCap,
      status: 'live'
    }
  });
});

// Service 2: Gas Estimate Check ($0.03)
app.post('/api/services/gas_estimate_check', (req, res) => {
  const { transaction_type, chain_id } = req.body;

  if (!transaction_type || !chain_id) {
    return res.status(400).json({ error: 'transaction_type and chain_id required' });
  }

  // Base mainnet (8453) gas estimates
  const gasEstimates = {
    'transfer': 21000,
    'swap': 120000,
    'approve': 45000,
    'mint': 180000,
    'burn': 60000
  };

  const baseGas = gasEstimates[transaction_type.toLowerCase()] || 100000;
  const gweiBump = chain_id === '8453' ? 1.5 : 1.2;
  const estimatedGwei = (baseGas / 1e9 * gweiBump).toFixed(4);

  res.json({
    service: 'gas_estimate_check',
    price: '$0.03',
    timestamp: new Date().toISOString(),
    data: {
      transactionType: transaction_type,
      chainId: chain_id,
      estimatedGas: baseGas,
      estimatedGwei: estimatedGwei,
      confidence: 'high',
      status: 'live'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    services: [
      { name: 'token_metadata_lookup', price: '$0.02', status: 'live' },
      { name: 'gas_estimate_check', price: '$0.03', status: 'live' }
    ],
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    agent: 'Agent_s_Intelligence_Kiosk',
    services: 2,
    offerings: [
      'token_metadata_lookup ($0.02)',
      'gas_estimate_check ($0.03)'
    ]
  });
});

// Serve registration HTML
app.get('/register.html', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Register ACP Offerings</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #1a1a1a; color: #fff; }
        button { padding: 15px 30px; font-size: 16px; background: #00d4ff; color: #000; border: none; cursor: pointer; border-radius: 5px; }
        button:hover { background: #00b8d4; }
        #status { margin-top: 20px; padding: 15px; background: #222; border-radius: 5px; }
      </style>
    </head>
    <body>
      <h1>Register Agent_s_Intelligence_Kiosk Offerings</h1>
      <p>Click to register:</p>
      <button onclick="registerOfferings()">Register Now</button>
      <div id="status"></div>

      <script>
        async function registerOfferings() {
          const statusDiv = document.getElementById('status');
          statusDiv.innerHTML = 'Registering...';
          
          try {
            const response = await fetch('https://agent-services-ruddy.vercel.app/api/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-registration-token': 'my-secret-token'
              }
            });
            
            const data = await response.json();
            
            if (response.ok) {
              statusDiv.innerHTML = '<h2>✅ SUCCESS!</h2><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } else {
              statusDiv.innerHTML = '<h2>❌ Error:</h2><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            }
          } catch (error) {
            statusDiv.innerHTML = '<h2>❌ Failed:</h2><p>' + error.message + '</p>';
          }
        }
      </script>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Agent Services running on port ${PORT}`);
});
