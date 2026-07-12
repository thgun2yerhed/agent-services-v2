curl -i -X POST https://api.cdp.coinbase.com/platform/v2/x402/validate \
  -H "Content-Type: application/json" \
  -d '{
    "resource": "https://agent-services-seven.vercel.app/",
    "method": "POST"
  }'
