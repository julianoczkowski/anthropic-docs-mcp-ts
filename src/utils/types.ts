export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface DocumentResult {
  url: string;
  title: string;
  text: string;
}

export interface ServerConfig {
  name: string;
  version: string;
  userAgent: string;
}

export const SERVER_CONFIG: ServerConfig = {
  name: "anthropic-docs-mcp-ts",
  version: "0.1.0",
  userAgent: "anthropic-docs-mcp-ts/0.1.0",
};
