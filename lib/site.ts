import type { Metadata } from "next";
import { getProduct, type DocPage } from "@/lib/content";

/* Server-only by way of `@/lib/content`: client components must not import
 * this module. Pass what they need as props instead. */

export const SITE = {
  name: "Caveman docs",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://docs.caveman.so",
  app: "https://caveman.so",
  console: "https://app.caveman.so",
  github: "https://github.com/JuliusBrussee/caveman",
  description:
    "Documentation for Caveman and Caveman Cloud. Caveman is open source: a skill that makes AI coding agents say less, and a CLI, local proxy and Engine that shrink what they read, on your machine with your keys. Caveman Cloud is the hosted product that shows what your agents cost and cuts it, with proof: traces, evals and improvements, with every saving labeled by its evidence.",
} as const;

export function ogUrl(title: string, summary: string, eyebrow?: string): string {
  const params = new URLSearchParams({ title, summary });
  if (eyebrow) params.set("eyebrow", eyebrow);
  return `${SITE.url}/og?${params.toString()}`;
}

/** Page metadata, read from the page's own front matter and docs.json. */
export function docMetadata(page: DocPage): Metadata {
  const product = getProduct(page.product);
  const url = `${SITE.url}${page.href}`;
  const markdown = `${url}.md`;
  const image = ogUrl(page.title, page.description, product?.name);
  const social = `${page.title} · ${SITE.name}`;

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: url,
      // The plain-text twin, announced so a machine can find it without
      // guessing a URL scheme or parsing the page.
      types: { "text/markdown": markdown },
    },
    openGraph: {
      title: social,
      description: page.description,
      url,
      siteName: SITE.name,
      type: "article",
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: social,
      description: page.description,
      images: [image],
    },
    other: {
      // Read by tools that scan meta tags rather than link relations.
      "caveman:markdown": markdown,
      ...(product ? { "caveman:product": product.name } : {}),
    },
  };
}
