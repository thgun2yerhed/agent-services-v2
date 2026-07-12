export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json({
    service: "Base Wallet Compliance Oracle",
    status: "operational",
    endpoint: "https://agent-services-jaxu09p3k-spin-strz.vercel.app/api"
  });
}
