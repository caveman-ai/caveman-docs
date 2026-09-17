import type { Metadata } from "next";
import { DOCS_FLAT, docPath, layerOf } from "@/lib/docs-nav";

export const SITE = {
  name: "Caveman docs",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://docs.caveman.so",
  app: "https://caveman.so",
  console: "https://app.caveman.so",
  github: "https://github.com/JuliusBrussee/caveman",
  description:
    "Caveman makes AI coding agents cheaper: a rule file that shortens what the agent writes, a local proxy that compresses what it reads and can hand back every byte, and an SDK for building agents with a declared budget. Install, examples, how each compressor works, and every number with its source.",
} as const;

export function ogUrl(title: string, summary: string, eyebrow?: string): string {
  const params = new URLSearchParams({ title, summary });
  if (eyebrow) params.set("eyebrow", eyebrow);
  return `${SITE.url}/og?${params.toString()}`;
}

/** Page metadata, read from the nav so a page never restates its own title. */
export function docMetadata(slug: string): Metadata {
  const doc = DOCS_FLAT.find((d) => d.slug === slug);
  if (!doc) return {};
  const layer = layerOf(doc.layer);
  const title = layer && doc.slug === layer.id ? layer.name : doc.title;
  const url = `${SITE.url}${docPath(slug)}`;
  const markdown = `${url}.md`;
  const eyebrow = layer ? `${String(layer.rank).padStart(2, "0")} ${layer.name}` : "Caveman docs";
  const image = ogUrl(title, doc.blurb, eyebrow);

  return {
    title,
    description: doc.blurb,
    alternates: {
      canonical: url,
      // The plain-text twin, announced so a machine can find it without
      // guessing a URL scheme or parsing the page.
      types: { "text/markdown": markdown },
    },
    openGraph: {
      title: `${title} · Caveman docs`,
      description: doc.blurb,
      url,
      type: "article",
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Caveman docs`,
      description: doc.blurb,
      images: [image],
    },
    other: {
      // Read by tools that scan meta tags rather than link relations.
      "caveman:markdown": markdown,
      ...(doc.license ? { "caveman:license": doc.license } : {}),
      ...(doc.capability ? { "caveman:capability": doc.capability } : {}),
      ...(layer ? { "caveman:layer": `${layer.rank} ${layer.name}` } : {}),
    },
  };
}
