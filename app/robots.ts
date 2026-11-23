import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/* ==========================================================================
 *  Crawler policy.
 *
 *  Everything here is public documentation. Crawlers that feed answer engines
 *  and user-triggered agents may read all of it: documentation nobody is
 *  allowed to learn from is documentation that answers no questions.
 *
 *  Training-only crawlers, which never send a reader back, are told no. The
 *  answer engines are named individually rather than left to the wildcard.
 *  Several of them, Google-Extended in particular, are only consulted as
 *  named agents and read a missing entry as undecided rather than allowed.
 * ======================================================================== */

const ANSWER_ENGINES = [
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
  "DuckAssistBot",
  "MistralAI-User",
  "DeepSeekBot",
  "cohere-ai",
  "Meta-ExternalAgent",
  "YouBot",
];

const TRAINING_ONLY = ["CCBot", "Bytespider", "ByteSpider", "Amazonbot", "omgili", "Diffbot", "ImagesiftBot", "Timpibot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: ANSWER_ENGINES, allow: "/" },
      { userAgent: TRAINING_ONLY, disallow: "/" },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
