# Anthropic Docs MCP Server

A TypeScript Model Context Protocol (MCP) server that provides comprehensive search and retrieval capabilities for Claude and Anthropic documentation, optimized for MCP development, APIs, examples, and templates.

## Features

- **Comprehensive Documentation Search**: Search through 100+ Claude documentation pages with intelligent relevance scoring
- **MCP Development Focus**: Optimized for MCP development, API integration, and tool building
- **Multi-Strategy Search**: Direct crawling, DuckDuckGo, and alternative search engines with fallbacks
- **Intelligent Relevance Scoring**: Results prioritized for MCP development, APIs, and examples
- **Fetch Documentation Content**: Retrieve and clean documentation pages with intelligent content extraction
- **IDE Integration**: Works seamlessly with Cursor and VS Code through MCP
- **Dual Transport Support**: Supports both stdio (for IDE integration) and HTTP (for web clients)
- **Intelligent Content Processing**: Automatically cleans HTML and extracts meaningful content

## Tools

### `search_anthropic_docs`

Search Claude and Anthropic documentation with intelligent relevance scoring optimized for MCP development, APIs, examples, and templates.

**Parameters:**

- `query` (string, required): Search query for Claude documentation (supports MCP, API, SDK, and development-focused queries)
- `max_results` (number, optional): Maximum number of results to return (1-10, default: 5)

**Example:**

```json
{
  "query": "MCP server development",
  "max_results": 3
}
```

**Search Optimization:**

- Prioritizes MCP documentation and examples
- Boosts relevance for API, SDK, and development content
- Sorts results by relevance to your development needs
- Covers 100+ documentation pages including MCP, Claude Code, APIs, and tools

### `fetch_doc`

Fetch and clean a documentation page from a URL with intelligent content extraction.

**Parameters:**

- `url` (string, required): URL of the documentation page to fetch (supports docs.claude.com URLs)
- `max_chars` (number, optional): Maximum characters to return (500-20000, default: 4000)

**Example:**

```json
{
  "url": "https://docs.claude.com/en/docs/agents-and-tools/mcp-connector",
  "max_chars": 2000
}
```

**Supported URLs:**

- All docs.claude.com documentation pages
- MCP documentation and guides
- API references and examples
- Claude Code documentation

## Search Optimization

This MCP server is specifically optimized for MCP development and provides intelligent search results:

### **Priority Categories**

1. **Core MCP Documentation** (Highest Priority)
2. **Claude Code MCP Integration**
3. **API Documentation**
4. **SDK and Development Tools**
5. **Tool Use and Examples**
6. **Prompt Engineering and Templates**
7. **Resources and Examples**
8. **Advanced Features**
9. **Security and Best Practices**
10. **Integration and Deployment**

### **Relevance Scoring**

- **MCP keywords** (+25 points): mcp, model context protocol, server, client, tool, api
- **Development keywords** (+15 points): sdk, python, typescript, javascript, example, template, guide, tutorial
- **API keywords** (+10 points): api, endpoint, request, response, authentication, key
- **URL path priority**: MCP docs get highest priority, followed by SDK and API documentation

### **Search Strategies**

1. **Direct Crawling** (Primary): Searches 100+ curated documentation pages
2. **DuckDuckGo** (Fallback): External search with multiple selectors
3. **Alternative Engine** (Backup): Bing search as final fallback

## Installation

1. **Clone or download this repository**
2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

## Usage

### Development Mode

**Stdio Transport (for IDE integration):**

```bash
npm run dev
```

**HTTP Transport (for web clients):**

```bash
npm run dev:http
```

### Production Mode

**Stdio Transport:**

```bash
npm start
```

**HTTP Transport:**

```bash
node dist/server.js --transport http --port 8974
```

## IDE Integration

### Cursor Integration

The server is pre-configured for Cursor integration. The configuration is located in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "anthropic-docs": {
      "command": "node",
      "args": ["${workspaceFolder}/dist/server.js", "--transport", "stdio"]
    }
  }
}
```

**To use in Cursor:**

1. Build the project: `npm run build`
2. Open Cursor
3. Go to Settings → MCP → Add New MCP Server
4. The server should appear in the list and be automatically connected

### VS Code Integration

The server is pre-configured for VS Code integration. The configuration is located in `.vscode/mcp.json`:

```json
{
  "servers": {
    "anthropic-docs": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/dist/server.js", "--transport", "stdio"]
    }
  }
}
```

**To use in VS Code:**

1. Build the project: `npm run build`
2. Open VS Code
3. Open the Chat view
4. Switch to Agent mode
5. Go to Tools → enable `anthropic-docs` tools
6. The tools `search_anthropic_docs` and `fetch_doc` should be available

## Global Configuration

### Cursor Global Configuration

To use this server across all projects in Cursor, add the following to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "anthropic-docs": {
      "command": "node",
      "args": [
        "/absolute/path/to/anthropic-docs-mcp-ts/dist/server.js",
        "--transport",
        "stdio"
      ]
    }
  }
}
```

### VS Code Global Configuration

For VS Code, you can configure the server globally through the MCP extension settings.

## Architecture

### Project Structure

```
anthropic-docs-mcp-ts/
├── src/
│   ├── server.ts           # Main server implementation
│   ├── tools/
│   │   ├── search.ts       # Search functionality
│   │   └── fetch.ts        # Document fetching
│   ├── utils/
│   │   ├── html-cleaner.ts # HTML processing utilities
│   │   └── types.ts        # Type definitions
│   └── transports/
│       ├── stdio.ts        # Stdio transport setup
│       └── http.ts         # HTTP transport setup
├── dist/                   # Compiled output
├── .cursor/mcp.json        # Cursor configuration
├── .vscode/mcp.json        # VS Code configuration
└── package.json
```

### Key Components

- **MCP Server**: Uses the modern `McpServer` class from the MCP SDK
- **Multi-Strategy Search**: Direct crawling, DuckDuckGo, and alternative search engines with intelligent fallbacks
- **Relevance Scoring**: Advanced scoring system that prioritizes MCP development, APIs, and examples
- **Content Processing**: Uses Cheerio for intelligent HTML parsing and content extraction
- **Transport Layer**: Supports both stdio and HTTP transports
- **Input Validation**: Uses Zod for robust input validation
- **Comprehensive Coverage**: 100+ curated documentation URLs organized by development priority

## Development

### Prerequisites

- Node.js 18+ (uses global `fetch`)
- TypeScript 5.6+
- npm or yarn

### Scripts

- `npm run dev`: Start development server with stdio transport
- `npm run dev:http`: Start development server with HTTP transport
- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Start production server with stdio transport

### Dependencies

**Production:**

- `@modelcontextprotocol/sdk`: MCP SDK for server implementation
- `cheerio`: HTML parsing and content extraction
- `zod`: Input validation and schema definition
- `express`: HTTP server for web transport

**Development:**

- `typescript`: TypeScript compiler
- `tsx`: TypeScript execution for development
- `@types/node`: Node.js type definitions
- `@types/cheerio`: Cheerio type definitions
- `@types/express`: Express type definitions

## Troubleshooting

### Common Issues

1. **Server won't start**: Ensure all dependencies are installed with `npm install`
2. **Tools not appearing in IDE**: Make sure the project is built with `npm run build`
3. **Search returns no results**: Check your internet connection and try different search terms
4. **HTTP transport issues**: Ensure the port is available and not blocked by firewall
5. **MCP connection issues**: Restart Cursor/VS Code to pick up new MCP server builds
6. **Old URLs in results**: The server uses docs.claude.com - both docs.anthropic.com and docs.claude.com redirect to the same content

### Debug Mode

To run with debug logging, set the `DEBUG` environment variable:

```bash
DEBUG=* npm run dev
```

### Logs

The server logs important information to stderr, including:

- Server startup messages
- Transport configuration
- Error messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License - see LICENSE file for details.

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review the MCP documentation
3. Open an issue on the repository
