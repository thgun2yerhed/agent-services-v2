import gateway from './gateway.js';

export default function handler(req, res) {
  // Route to gateway for all requests
  return gateway(req, res);
}