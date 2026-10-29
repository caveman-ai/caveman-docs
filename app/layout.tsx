import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Shell } from "@/components/shell/shell";
import { getNav } from "@/lib/content";
import { SITE, ogUrl } from "@/lib/site";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const TITLE = "Caveman docs";
const SUMMARY =
  "Guides and reference for Caveman, the open-source skill, CLI and proxy, and Caveman Cloud, which shows what your agents cost and cuts it, with proof.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: TITLE, template: "%s · Caveman docs" },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: "Caveman", url: SITE.app }],
  alternates: { canonical: "/", types: { "text/markdown": `${SITE.url}/index.md` } },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    url: SITE.url,
    title: TITLE,
    description: SITE.description,
    images: [{ url: ogUrl(TITLE, SUMMARY), width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: SITE.description, images: [ogUrl(TITLE, SUMMARY)] },
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#09090a", colorScheme: "dark" };

/* Told once, at the root, so every page inherits it: what this site is, who
 * publishes it, and that it documents two products. */
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.app}#organization`,
      name: "Caveman",
      url: SITE.app,
      logo: `${SITE.app}/favicon.svg`,
      email: "contact@caveman.so",
      sameAs: [SITE.app, SITE.github, "https://github.com/caveman-ai", "https://www.npmjs.com/package/@caveman-ai/cli"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}#website`,
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      inLanguage: "en",
      publisher: { "@id": `${SITE.app}#organization` },
      isPartOf: { "@type": "WebSite", name: "Caveman", url: SITE.app },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <head>
        {/* Announced in the head as well as robots.txt: agents look in both. */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
      </head>
      <body className="min-h-dvh font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-3 focus:py-1.5 focus:text-[13px] focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <Shell nav={getNav()}>{children}</Shell>
      </body>
    </html>
  );
}
