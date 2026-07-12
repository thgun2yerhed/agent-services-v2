import fs from "fs";

// Parse active repository configuration parameters dynamically
const packageConfig = JSON.parse(fs.readFileSync("./package.json", "utf8"));
const gatewayUrl = "https://agent-services-seven.vercel.app/";

const manifestPayload = {
  id: `io.vercel.${packageConfig.name || "agent-services"}`,
  name: "Base Transaction Resolver",
  description: "An HTTP Server-Sent Events (SSE) protocol gateway that extracts, parses, and returns live block details for execution transactions.",
  transport: {
    type: "sse",
    url: gatewayUrl
  },
  capabilities: {
    tools: true
  },
  version: packageConfig.version || "1.0.0"
};

fs.writeFileSync("./mcp-manifest.json", JSON.stringify(manifestPayload, null, 2));
console.log("[+] Standardized mcp-manifest.json compiled successfully.");
