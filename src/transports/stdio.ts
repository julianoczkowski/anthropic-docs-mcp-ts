import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

/**
 * Create and configure stdio transport for IDE integration
 */
export function createStdioTransport(): StdioServerTransport {
  return new StdioServerTransport();
}
