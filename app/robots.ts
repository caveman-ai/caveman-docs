import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/* ==========================================================================
 *  Crawler policy.
 *
 *  Everything here is public documentation and all of it is crawlable,
 *  including for training. That is a deliberate choice: documentation nobody
 *  is allowed to learn from is documentation that answers no questions.
 *
 *  The AI crawlers are named individually rather than left to the wildcard.
 *  Several of them, Google-Extended in particular, are only consulted as
 *  named agents and read a missing entry as undecided rather than allowed.
 *  Naming them removes the ambiguity in the direction we actually want.
 * ======================================================================== */

const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "Google-Extended",
  "PerplexityBot",
  "Perplexity-User",
  "Applebot-Extended",
  "CCBot",
  "cohere-ai",
  "Meta-ExternalAgent",
  "Amazonbot",
  "DuckAssistBot",
  "Bytespider",
  "Timpibot",
  "YouBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: AI_AGENTS, allow: "/" },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
