import type { DocumentResult } from "../utils/types.js";
import { SERVER_CONFIG } from "../utils/types.js";
import { cleanText, extractTitle } from "../utils/html-cleaner.js";

/**
 * Fetch and clean a documentation page from a URL
 */
export async function fetchDoc(
  url: string,
  maxChars = 4000
): Promise<DocumentResult> {
  const headers = { "User-Agent": SERVER_CONFIG.userAgent };

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }

  const html = await response.text();
  const title = extractTitle(html, url).slice(0, 200);
  let text = cleanText(html);

  // Truncate if too long
  if (text.length > maxChars) {
    text = text.slice(0, maxChars - 1) + "…";
  }

  return { url, title, text };
}
