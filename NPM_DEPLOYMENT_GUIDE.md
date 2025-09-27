# NPM Deployment Guide for Anthropic Docs MCP Server

This guide will walk you through deploying your MCP (Model Context Protocol) server to NPM, making it available for others to install and use.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Package Configuration](#package-configuration)
3. [NPM Account Setup](#npm-account-setup)
4. [Manual Deployment](#manual-deployment)
5. [Automated Deployment with GitHub Actions](#automated-deployment-with-github-actions)
6. [Testing Your Published Package](#testing-your-published-package)
7. [Version Management](#version-management)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying to NPM, ensure you have:

- [ ] Node.js and npm installed
- [ ] A GitHub repository (✅ You have: `julianoczkowski/anthropic-docs-mcp-ts`)
- [ ] An NPM account
- [ ] Your MCP server is working locally

## Package Configuration

### 1. Update package.json

Your current `package.json` needs some modifications for NPM publishing:

```json
{
  "name": "@julianoczkowski/anthropic-docs-mcp-ts",
  "version": "1.0.0",
  "description": "MCP server for Anthropic documentation with search and fetch capabilities",
  "main": "dist/server.js",
  "bin": {
    "anthropic-docs-mcp": "dist/server.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "ts-node src/server.ts",
    "prepublishOnly": "npm run build"
  },
  "files": ["dist/", "README.md", "package.json"],
  "keywords": [
    "mcp",
    "model-context-protocol",
    "anthropic",
    "documentation",
    "search",
    "fetch"
  ],
  "author": "Julian Oczkowski <your-email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/julianoczkowski/anthropic-docs-mcp-ts.git"
  },
  "homepage": "https://github.com/julianoczkowski/anthropic-docs-mcp-ts#readme",
  "bugs": {
    "url": "https://github.com/julianoczkowski/anthropic-docs-mcp-ts/issues"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.4.0",
    "cheerio": "^1.0.0-rc.12",
    "node-fetch": "^3.3.2"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.0.0"
  }
}
```

### 2. Create .npmignore

Create a `.npmignore` file to exclude unnecessary files from the published package:

```
src/
tsconfig.json
.git/
.gitignore
node_modules/
*.log
.env
.env.local
.env.*.local
coverage/
.nyc_output/
.vscode/
.idea/
*.swp
*.swo
*~
```

### 3. Add Entry Point Script

Create a simple entry point script in your `src/server.ts` or create a new `bin/server.js`:

```javascript
#!/usr/bin/env node
require("../dist/server.js");
```

## NPM Account Setup

### 1. Create NPM Account

1. Go to [npmjs.com](https://www.npmjs.com)
2. Click "Sign Up"
3. Verify your email address

### 2. Login to NPM

```bash
npm login
```

Enter your NPM username, password, and email when prompted.

### 3. Verify Login

```bash
npm whoami
```

## Manual Deployment

### 1. Build Your Package

```bash
npm run build
```

### 2. Test Locally (Optional)

```bash
npm pack
```

This creates a `.tgz` file you can test locally. The filename will be based on your package name and version:

```bash
# For local testing (without global installation)
npm install ./julianoczkowski-anthropic-docs-mcp-ts-0.1.0.tgz

# For global testing (requires sudo on Linux/macOS)
sudo npm install -g ./julianoczkowski-anthropic-docs-mcp-ts-0.1.0.tgz
```

**Note**: The exact filename will be `julianoczkowski-anthropic-docs-mcp-ts-{version}.tgz` where `{version}` matches your package.json version.

### 3. Test with Dry Run (Recommended)

Before publishing, test what will be published:

```bash
npm publish --dry-run
```

This shows you exactly what files will be included and any warnings.

### 4. Publish to NPM

```bash
npm publish --access public
```

**Note**: Use `--access public` if your package name starts with `@username/` (scoped package).

### 5. Verify Publication

Check your package on [npmjs.com](https://www.npmjs.com/package/@julianoczkowski/anthropic-docs-mcp-ts)

## Automated Deployment with GitHub Actions

### 1. Create GitHub Actions Workflow

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to NPM

on:
  push:
    tags:
      - "v*"
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          registry-url: "https://registry.npmjs.org"

      - name: Install dependencies
        run: npm ci

      - name: Build package
        run: npm run build

      - name: Publish to NPM
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 2. Set Up NPM Token

1. Go to [npmjs.com](https://www.npmjs.com) → Account Settings → Access Tokens
2. Generate a new "Automation" token
3. Copy the token
4. In your GitHub repository:
   - Go to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your NPM token

### 3. Create and Push Tags

To trigger the automated deployment:

```bash
# Create a new tag
git tag v1.0.0

# Push the tag
git push origin v1.0.0
```

## Testing Your Published Package

### 1. Install Your Package

```bash
npm install -g @julianoczkowski/anthropic-docs-mcp-ts
```

### 2. Test the MCP Server

```bash
anthropic-docs-mcp
```

### 3. Test with MCP Client

You can test your MCP server with any MCP-compatible client by configuring it to use your server.

## Version Management

### Semantic Versioning

Follow [semantic versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backward compatible
- **PATCH** (0.0.1): Bug fixes, backward compatible

### Updating Versions

```bash
# Patch version (bug fixes)
npm version patch

# Minor version (new features)
npm version minor

# Major version (breaking changes)
npm version major
```

### Publishing Updates

```bash
# After version bump
git push origin main --tags
```

## Usage Instructions for Users

Add this section to your README.md:

````markdown
## Installation

```bash
npm install -g @julianoczkowski/anthropic-docs-mcp-ts
```
````

## Usage

### As a Global Command

```bash
anthropic-docs-mcp
```

### As a Library

```javascript
const { createServer } = require("@julianoczkowski/anthropic-docs-mcp-ts");

const server = createServer();
server.start();
```

### MCP Client Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "anthropic-docs": {
      "command": "anthropic-docs-mcp",
      "args": []
    }
  }
}
```

````

## Troubleshooting

### Common Issues

1. **"Package name already exists"**
   - Choose a different package name
   - Use scoped naming: `@username/package-name`

2. **"Access denied"**
   - Ensure you're logged in: `npm whoami`
   - Check package permissions

3. **"Build failed"**
   - Ensure TypeScript compiles: `npm run build`
   - Check for TypeScript errors

4. **"Module not found"**
   - Verify `main` field in package.json points to correct file
   - Check `files` array includes necessary files

5. **"ENOENT: no such file or directory" when testing with npm install -g**
   - Make sure you run `npm pack` first to create the .tgz file
   - Use the correct filename: `julianoczkowski-anthropic-docs-mcp-ts-{version}.tgz`
   - For global installation on Linux/macOS, use `sudo npm install -g ./filename.tgz`

6. **"EACCES: permission denied"**
   - Use `sudo` for global installations on Linux/macOS
   - Or test locally without global installation: `npm install ./filename.tgz`

### Useful Commands

```bash
# Check package contents before publishing
npm pack --dry-run

# View package info
npm info @julianoczkowski/anthropic-docs-mcp-ts

# Unpublish (within 24 hours)
npm unpublish @julianoczkowski/anthropic-docs-mcp-ts@1.0.0
````

## Next Steps

1. ✅ Update your `package.json` with the recommended configuration
2. ✅ Create `.npmignore` file
3. ✅ Set up NPM account and login
4. ✅ Test build locally
5. ✅ Publish to NPM
6. ✅ Set up GitHub Actions for automated publishing
7. ✅ Update README with installation instructions
8. ✅ Create your first release tag

## Support

If you encounter issues:

1. Check the [NPM documentation](https://docs.npmjs.com/)
2. Review [GitHub Actions documentation](https://docs.github.com/en/actions)
3. Open an issue in your repository

---

**Congratulations!** Once completed, your MCP server will be available for anyone to install and use via NPM.
