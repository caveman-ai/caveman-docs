import type { Metadata } from "next";
import { DOCS_FLAT, docPath, layerOf } from "@/lib/docs-nav";

export const SITE = {
  name: "Caveman docs",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://docs.caveman.so",
  app: "https://caveman.so",
  console: "https://app.caveman.so",
  github: "https://github.com/JuliusBrussee/caveman",
  description:
    "Documentation for the open Caveman stack: the agent skill, the compression engine, and cavemem. What each layer does, what it costs, and how every number is counted.",
} as const;

/** Page metadata, read from the nav so a page never restates its own title. */
export function docMetadata(slug: string): Metadata {
  const doc = DOCS_FLAT.find((d) => d.slug === slug);
  if (!doc) return {};
  const layer = layerOf(doc.layer);
  const title = layer && doc.slug === layer.id ? `${doc.title}: ${layer.name}` : doc.title;
  const url = `${SITE.url}${docPath(slug)}`;
  return {
    title,
    description: doc.blurb,
    alternates: {
      canonical: url,
      // The plain-text mirror, announced so agents can find it without guessing.
      types: { "text/markdown": `${url}.md` },
    },
    openGraph: { title: `${title} · Caveman docs`, description: doc.blurb, url, type: "article" },
    twitter: { card: "summary_large_image", title: `${title} · Caveman docs`, description: doc.blurb },
  };
}
