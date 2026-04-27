import { MCPServer, APIKeyAuthProvider } from "mcp-framework";
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env') });

const apiKey = process.env.INMOVILLA_API_TOKEN;

if (!apiKey) {
  throw new Error("API key not found");
}

const mcpApiKey = process.env.MCP_API_KEY;
if (!mcpApiKey) {
  throw new Error("MCP_API_KEY not found");
}

const server = new MCPServer({
  transport: {
    type: "http-stream",
    options: {
      port: 1337,
      cors: {
        allowOrigin: "*"
      }
    },
    auth: {
      provider: new APIKeyAuthProvider({
        keys: [mcpApiKey]
      })
    }
  }
});

server.start();