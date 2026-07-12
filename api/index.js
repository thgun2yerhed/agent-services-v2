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
    const targetAddress = payload.targetAddress || payload.address || payload.target || req.query.address;

    if (!targetAddress || !targetAddress.startsWith('0x')) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Valid target hex address required' }));
    }

    const rpcResponse = await fetch('https://mainnet.base.org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getCode',
        params: [targetAddress, 'latest']
      })
    });

    const rpcData = await rpcResponse.json();
    const bytecode = rpcData.result;
    const isLiveContract = bytecode && bytecode !== '0x';

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      protocol: "ACP-2026",
      target: targetAddress,
      active_deployment: isLiveContract,
      bytecode_length: bytecode ? (bytecode.length - 2) / 2 : 0,
      timestamp: Date.now()
    }));

  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: error.message }));
  }
}
