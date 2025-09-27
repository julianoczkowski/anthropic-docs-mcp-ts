#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SERVER_CONFIG } from "./utils/types.js";
import { searchAnthropicDocs } from "./tools/search.js";
import { fetchDoc } from "./tools/fetch.js";
import { createStdioTransport } from "./transports/stdio.js";
import { createHttpTransport } from "./transports/http.js";

/**
 * Parse command line arguments
 */
function parseArgs(): { transport: string; port: number } {
  const args = new Map<string, string>();

  for (let i = 2; i < process.argv.length; i += 2) {
    const key = process.argv[i];
    const value = process.argv[i + 1];
    if (key?.startsWith("--")) {
      args.set(key.slice(2), value ?? "");
    }
  }

  return {
    transport: args.get("transport") ?? "stdio",
    port: Number(args.get("port") ?? "8974"),
  };
}

/**
 * Create and configure the MCP server
 */
function createServer(): McpServer {
  const server = new McpServer({
    name: SERVER_CONFIG.name,
    version: SERVER_CONFIG.version,
  });

  // Register search_anthropic_docs tool
  server.registerTool(
    "search_anthropic_docs",
    {
      title: "Search Anthropic Documentation",
      description:
        "Search Anthropic documentation (docs.anthropic.com) for a query and return top results.",
      inputSchema: {
        query: z
          .string()
          .min(1)
          .describe("Search query for Anthropic documentation"),
        max_results: z
          .number()
          .min(1)
          .max(10)
          .default(5)
          .describe("Maximum number of results to return (1-10)"),
      },
    },
    async ({ query, max_results }) => {
      try {
        const results = await searchAnthropicDocs(query, max_results);
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        };
      } catch (error: any) {
        return {
          content: [
            { type: "text", text: `Error searching docs: ${error.message}` },
          ],
        };
      }
    }
  );

  // Register fetch_doc tool
  server.registerTool(
    "fetch_doc",
    {
      title: "Fetch Documentation",
      description:
        "Fetch and clean a documentation page from a URL, returning title + text.",
      inputSchema: {
        url: z
          .string()
          .url()
          .describe("URL of the documentation page to fetch"),
        max_chars: z
          .number()
          .min(500)
          .max(20000)
          .default(4000)
          .describe("Maximum characters to return (500-20000)"),
      },
    },
    async ({ url, max_chars }) => {
      try {
        const doc = await fetchDoc(url, max_chars);
        return {
          content: [{ type: "text", text: JSON.stringify(doc, null, 2) }],
        };
      } catch (error: any) {
        return {
          content: [
            { type: "text", text: `Error fetching doc: ${error.message}` },
          ],
        };
      }
    }
  );

  return server;
}

/**
 * Main server function
 */
async function run(): Promise<void> {
  const { transport, port } = parseArgs();
  const server = createServer();

  try {
    if (transport === "stdio") {
      const stdioTransport = createStdioTransport();
      await server.connect(stdioTransport);
      console.error(`${SERVER_CONFIG.name} running on stdio transport`);
    } else if (transport === "http") {
      const { transport: httpTransport, app } = createHttpTransport(port);
      await server.connect(httpTransport);

      app.listen(port, () => {
        console.error(
          `${SERVER_CONFIG.name} listening on http://127.0.0.1:${port}`
        );
      });
    } else {
      throw new Error(`Unsupported transport: ${transport}`);
    }
  } catch (error) {
    console.error("Server error:", error);
    process.exit(1);
  }
}

// Start the server
run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
