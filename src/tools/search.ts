import * as cheerio from "cheerio";
import type { SearchResult } from "../utils/types.js";
import { SERVER_CONFIG } from "../utils/types.js";
import { isAnthropicDocs, snippetFromHtml } from "../utils/html-cleaner.js";

/**
 * Search Anthropic documentation with focus on MCP development, APIs, examples, and templates
 */
export async function searchAnthropicDocs(
  query: string,
  maxResults = 5
): Promise<SearchResult[]> {
  const safeMax = Math.max(1, Math.min(Number(maxResults) || 5, 10));

  // Enhanced search strategies optimized for MCP development
  const strategies = [
    () => searchWithDirectCrawl(query, safeMax), // Prioritize direct crawl for better results
    () => searchWithDuckDuckGo(query, safeMax),
    () => searchWithAlternativeEngine(query, safeMax),
  ];

  for (const strategy of strategies) {
    try {
      const results = await strategy();
      if (results.length > 0) {
        // Sort results by relevance for MCP development
        return sortResultsByRelevance(results, query);
      }
    } catch (error) {
      console.error("Search strategy failed:", error);
      continue;
    }
  }

  // If all strategies fail, return helpful development-focused message
  return [
    {
      title: "Search temporarily unavailable",
      url: "https://docs.claude.com/en/docs/mcp",
      snippet: `Unable to search Claude documentation at the moment. For MCP development, check the main MCP documentation at https://docs.claude.com/en/docs/mcp or use the fetch_doc tool with specific URLs.`,
    },
  ];
}

/**
 * Search using DuckDuckGo (original method)
 */
async function searchWithDuckDuckGo(
  query: string,
  maxResults: number
): Promise<SearchResult[]> {
  const searchQuery = `site:docs.claude.com ${query}`;
  const searchUrl = "https://duckduckgo.com/html/";
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  };

  // Try GET first; fallback to POST
  let html = "";
  try {
    const response = await fetch(
      `${searchUrl}?q=${encodeURIComponent(searchQuery)}`,
      { headers }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    html = await response.text();
  } catch {
    // Fallback to POST request
    const response = await fetch(searchUrl, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `q=${encodeURIComponent(searchQuery)}`,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    html = await response.text();
  }

  const $ = cheerio.load(html);
  const rawResults: Array<{ title: string; url: string }> = [];

  // Try multiple selectors for DuckDuckGo results
  const selectors = [
    "a.result__a",
    "a[data-testid='result-title-a']",
    ".result__title a",
    ".result a[href*='docs.claude.com']",
  ];

  for (const selector of selectors) {
    $(selector).each((_, element) => {
      const title = $(element).text().trim();
      const url = $(element).attr("href") || "";
      if (title && url && isAnthropicDocs(url)) {
        rawResults.push({ title, url });
      }
    });
    if (rawResults.length > 0) break;
  }

  return await fetchAndProcessResults(rawResults, maxResults);
}

/**
 * Search using direct crawling of known documentation pages
 */
async function searchWithDirectCrawl(
  query: string,
  maxResults: number
): Promise<SearchResult[]> {
  const headers = { "User-Agent": SERVER_CONFIG.userAgent };
  // Prioritized list focused on MCP development, APIs, examples, and templates
  const knownPages = [
    // Core MCP Documentation (Highest Priority)
    "https://docs.claude.com/en/docs/mcp",
    "https://docs.claude.com/en/docs/agents-and-tools/mcp",
    "https://docs.claude.com/en/docs/agents-and-tools/mcp-connector",
    "https://docs.claude.com/en/docs/agents-and-tools/remote-mcp-servers",

    // Claude Code MCP Integration
    "https://docs.claude.com/en/docs/claude-code/mcp",
    "https://docs.claude.com/en/docs/claude-code/sdk/sdk-mcp",
    "https://docs.claude.com/en/docs/claude-code/slash-commands",
    "https://docs.claude.com/en/docs/claude-code/tutorials",
    "https://docs.claude.com/en/docs/claude-code/setup",
    "https://docs.claude.com/en/docs/claude-code/common-workflows",

    // API Documentation
    "https://docs.claude.com/en/api/messages",
    "https://docs.claude.com/en/api/models",
    "https://docs.claude.com/en/api/client-sdks",
    "https://docs.claude.com/en/api/usage-cost-api",
    "https://docs.claude.com/en/api/administration-api",
    "https://docs.claude.com/en/api/beta-headers",
    "https://docs.claude.com/en/api/versioning",
    "https://docs.claude.com/en/api/getting-help",

    // SDK and Development Tools
    "https://docs.claude.com/en/docs/claude-code/sdk/sdk-overview",
    "https://docs.claude.com/en/docs/claude-code/sdk/sdk-python",
    "https://docs.claude.com/en/docs/claude-code/sdk/sdk-typescript",
    "https://docs.claude.com/en/docs/claude-code/sdk/sdk-sessions",
    "https://docs.claude.com/en/docs/claude-code/sdk/sdk-headless",
    "https://docs.claude.com/en/docs/claude-code/sdk/custom-tools",
    "https://docs.claude.com/en/docs/claude-code/sdk/subagents",
    "https://docs.claude.com/en/docs/claude-code/sdk/todo-tracking",
    "https://docs.claude.com/en/docs/claude-code/sdk/sdk-cost-tracking",
    "https://docs.claude.com/en/docs/claude-code/sdk/streaming-vs-single-mode",
    "https://docs.claude.com/en/docs/claude-code/sdk/modifying-system-prompts",

    // Tool Use and Examples
    "https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview",
    "https://docs.claude.com/en/docs/agents-and-tools/tool-use/implement-tool-use",
    "https://docs.claude.com/en/docs/agents-and-tools/tool-use/code-execution-tool",
    "https://docs.claude.com/en/docs/agents-and-tools/tool-use/web-search-tool",
    "https://docs.claude.com/en/docs/agents-and-tools/tool-use/web-fetch-tool",
    "https://docs.claude.com/en/docs/agents-and-tools/tool-use/computer-use-tool",
    "https://docs.claude.com/en/docs/agents-and-tools/tool-use/text-editor-tool",
    "https://docs.claude.com/en/docs/agents-and-tools/tool-use/bash-tool",

    // Prompt Engineering and Templates
    "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview",
    "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices",
    "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/prompt-generator",
    "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/prompt-improver",
    "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/multishot-prompting",
    "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/chain-prompts",
    "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct",
    "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/extended-thinking-tips",
    "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags",
    "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables",
    "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/system-prompts",
    "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/chain-of-thought",
    "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/long-context-tips",

    // Resources and Examples
    "https://docs.claude.com/en/resources/prompt-library",
    "https://docs.claude.com/en/resources/quickstarts",
    "https://docs.claude.com/en/docs/about-claude/use-case-guides/overview",
    "https://docs.claude.com/en/docs/about-claude/use-case-guides/customer-support-chat",
    "https://docs.claude.com/en/docs/about-claude/use-case-guides/legal-summarization",

    // Advanced Features
    "https://docs.claude.com/en/docs/build-with-claude/overview",
    "https://docs.claude.com/en/docs/build-with-claude/vision",
    "https://docs.claude.com/en/docs/build-with-claude/token-counting",
    "https://docs.claude.com/en/docs/build-with-claude/files",
    "https://docs.claude.com/en/docs/build-with-claude/batch-processing",
    "https://docs.claude.com/en/docs/build-with-claude/prompt-caching",
    "https://docs.claude.com/en/docs/build-with-claude/citations",
    "https://docs.claude.com/en/docs/build-with-claude/search-results",
    "https://docs.claude.com/en/docs/build-with-claude/pdf-support",

    // Security and Best Practices
    "https://docs.claude.com/en/docs/claude-code/security",
    "https://docs.claude.com/en/docs/test-and-evaluate/strengthen-guardrails/keep-claude-in-character",
    "https://docs.claude.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-hallucinations",
    "https://docs.claude.com/en/docs/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks",
    "https://docs.claude.com/en/docs/test-and-evaluate/strengthen-guardrails/increase-consistency",
    "https://docs.claude.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-prompt-leak",
    "https://docs.claude.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-latency",

    // Integration and Deployment
    "https://docs.claude.com/en/docs/claude-code/third-party-integrations",
    "https://docs.claude.com/en/docs/claude-code/amazon-bedrock",
    "https://docs.claude.com/en/docs/claude-code/google-vertex-ai",
    "https://docs.claude.com/en/docs/claude-code/llm-gateway",
    "https://docs.claude.com/en/docs/claude-code/github-actions",
    "https://docs.claude.com/en/docs/claude-code/gitlab-ci-cd",
    "https://docs.claude.com/en/docs/agents-and-tools/claude-for-sheets",

    // Configuration and Management
    "https://docs.claude.com/en/docs/claude-code/settings",
    "https://docs.claude.com/en/docs/claude-code/iam",
    "https://docs.claude.com/en/docs/claude-code/costs",
    "https://docs.claude.com/en/docs/claude-code/monitoring-usage",
    "https://docs.claude.com/en/docs/claude-code/data-usage",
    "https://docs.claude.com/en/docs/claude-code/memory",
    "https://docs.claude.com/en/docs/claude-code/hooks",
    "https://docs.claude.com/en/docs/claude-code/sub-agents",
    "https://docs.claude.com/en/docs/claude-code/ide-integrations",
    "https://docs.claude.com/en/docs/claude-code/cli-reference",
    "https://docs.claude.com/en/docs/claude-code/troubleshooting",

    // Reference and Support
    "https://docs.claude.com/en/docs/about-claude/models/overview",
    "https://docs.claude.com/en/docs/about-claude/pricing",
    "https://docs.claude.com/en/docs/about-claude/glossary",
    "https://docs.claude.com/en/home",
  ];

  const results: SearchResult[] = [];
  const queryLower = query.toLowerCase();

  for (const url of knownPages) {
    try {
      const response = await fetch(url, { headers });
      if (!response.ok) continue;

      const html = await response.text();
      const $ = cheerio.load(html);
      const title =
        $("title").first().text().trim() || "Anthropic Documentation";
      const text = $("body").text().toLowerCase();

      // Check if the query terms appear in the content
      const queryTerms = queryLower.split(/\s+/);
      const matchCount = queryTerms.filter((term) =>
        text.includes(term)
      ).length;

      if (matchCount > 0) {
        const snippet = snippetFromHtml(html, 260);
        results.push({ title, url, snippet });

        if (results.length >= maxResults) break;
      }

      // Be polite with rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch {
      continue;
    }
  }

  return results;
}

/**
 * Search using alternative search engine (Bing)
 */
async function searchWithAlternativeEngine(
  query: string,
  maxResults: number
): Promise<SearchResult[]> {
  const searchQuery = `site:docs.claude.com ${query}`;
  const searchUrl = "https://www.bing.com/search";
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  };

  try {
    const response = await fetch(
      `${searchUrl}?q=${encodeURIComponent(searchQuery)}`,
      { headers }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);
    const rawResults: Array<{ title: string; url: string }> = [];

    // Extract Bing search results
    $(".b_title a").each((_, element) => {
      const title = $(element).text().trim();
      const url = $(element).attr("href") || "";
      if (title && url && isAnthropicDocs(url)) {
        rawResults.push({ title, url });
      }
    });

    return await fetchAndProcessResults(rawResults, maxResults);
  } catch {
    throw new Error("Alternative search engine failed");
  }
}

/**
 * Fetch and process search results
 */
async function fetchAndProcessResults(
  rawResults: Array<{ title: string; url: string }>,
  maxResults: number
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const headers = { "User-Agent": SERVER_CONFIG.userAgent };

  for (const { title, url } of rawResults) {
    if (!isAnthropicDocs(url)) continue;

    try {
      const response = await fetch(url, { headers });
      if (!response.ok) continue;

      const pageHtml = await response.text();
      const snippet = snippetFromHtml(pageHtml, 260);

      results.push({ title, url, snippet });

      if (results.length >= maxResults) break;

      // Be polite with rate limiting
      await new Promise((resolve) => setTimeout(resolve, 250));
    } catch {
      // Skip failed requests
      continue;
    }
  }

  return results;
}

/**
 * Sort search results by relevance for MCP development
 */
function sortResultsByRelevance(
  results: SearchResult[],
  query: string
): SearchResult[] {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/);

  // Define priority keywords for MCP development
  const mcpKeywords = [
    "mcp",
    "model context protocol",
    "server",
    "client",
    "tool",
    "api",
  ];
  const developmentKeywords = [
    "sdk",
    "python",
    "typescript",
    "javascript",
    "example",
    "template",
    "guide",
    "tutorial",
  ];
  const apiKeywords = [
    "api",
    "endpoint",
    "request",
    "response",
    "authentication",
    "key",
  ];

  return results.sort((a, b) => {
    const aScore = calculateRelevanceScore(
      a,
      queryTerms,
      mcpKeywords,
      developmentKeywords,
      apiKeywords
    );
    const bScore = calculateRelevanceScore(
      b,
      queryTerms,
      mcpKeywords,
      developmentKeywords,
      apiKeywords
    );
    return bScore - aScore;
  });
}

/**
 * Calculate relevance score for a search result
 */
function calculateRelevanceScore(
  result: SearchResult,
  queryTerms: string[],
  mcpKeywords: string[],
  developmentKeywords: string[],
  apiKeywords: string[]
): number {
  let score = 0;
  const titleLower = result.title.toLowerCase();
  const snippetLower = result.snippet.toLowerCase();
  const urlLower = result.url.toLowerCase();

  // Exact title match gets highest score
  if (titleLower.includes(queryTerms.join(" "))) {
    score += 100;
  }

  // Individual query term matches
  queryTerms.forEach((term) => {
    if (titleLower.includes(term)) score += 20;
    if (snippetLower.includes(term)) score += 10;
    if (urlLower.includes(term)) score += 15;
  });

  // MCP-specific keywords boost
  mcpKeywords.forEach((keyword) => {
    if (
      titleLower.includes(keyword) ||
      snippetLower.includes(keyword) ||
      urlLower.includes(keyword)
    ) {
      score += 25;
    }
  });

  // Development keywords boost
  developmentKeywords.forEach((keyword) => {
    if (
      titleLower.includes(keyword) ||
      snippetLower.includes(keyword) ||
      urlLower.includes(keyword)
    ) {
      score += 15;
    }
  });

  // API keywords boost
  apiKeywords.forEach((keyword) => {
    if (
      titleLower.includes(keyword) ||
      snippetLower.includes(keyword) ||
      urlLower.includes(keyword)
    ) {
      score += 10;
    }
  });

  // URL path priority (MCP docs get higher priority)
  if (
    urlLower.includes("/docs/mcp") ||
    urlLower.includes("/agents-and-tools/mcp")
  ) {
    score += 30;
  }
  if (urlLower.includes("/claude-code/mcp") || urlLower.includes("/sdk/")) {
    score += 25;
  }
  if (urlLower.includes("/api/")) {
    score += 20;
  }
  if (
    urlLower.includes("/prompt-engineering/") ||
    urlLower.includes("/tool-use/")
  ) {
    score += 15;
  }

  return score;
}
