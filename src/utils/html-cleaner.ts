import * as cheerio from "cheerio";

/**
 * Check if a URL belongs to Claude documentation
 */
export function isAnthropicDocs(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname.endsWith("docs.claude.com");
  } catch {
    return false;
  }
}

/**
 * Clean HTML content by removing scripts, styles, and navigation elements
 */
export function cleanText(html: string): string {
  const $ = cheerio.load(html);

  // Remove unwanted elements
  $(
    "script, style, noscript, nav, header, footer, .nav, .navigation, .sidebar"
  ).remove();

  // Try to find main content area
  const main =
    $("main").first().text().trim() ||
    $("article").first().text().trim() ||
    $(".content").first().text().trim() ||
    $(".main-content").first().text().trim() ||
    $.root().text();

  // Normalize whitespace
  return main.replace(/\s+/g, " ").trim();
}

/**
 * Generate a snippet from HTML content
 */
export function snippetFromHtml(html: string, maxLength = 260): string {
  const text = cleanText(html);
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

/**
 * Extract title from HTML content
 */
export function extractTitle(html: string, fallbackUrl: string): string {
  const $ = cheerio.load(html);
  const title = $("title").first().text().trim();
  return title || fallbackUrl;
}
