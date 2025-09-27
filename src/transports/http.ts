import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "crypto";
import express from "express";

/**
 * Create and configure HTTP transport for web clients
 */
export function createHttpTransport(port: number): {
  transport: StreamableHTTPServerTransport;
  app: express.Application;
} {
  const app = express();
  app.use(express.json());

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });

  // Handle MCP requests
  app.all("/mcp", async (req, res) => {
    await transport.handleRequest(req, res, req.body);
  });

  return { transport, app };
}
