import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SITE, ogUrl } from "@/lib/site";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Caveman documentation", template: "%s · Caveman docs" },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: "Caveman", url: SITE.app }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    url: SITE.url,
    title: "Caveman documentation",
    description: SITE.description,
    images: [{ url: ogUrl("Caveman documentation", "The skill, the proxy, memory and the Agent SDK. What each part does, what it costs, and how every number is counted."), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Caveman documentation",
    description: SITE.description,
    images: [ogUrl("Caveman documentation", "The skill, the proxy, memory and the Agent SDK. What each part does, what it costs, and how every number is counted.")],
  },
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  icons: { icon: "/favicon.svg" },
};

/* Told once, at the root, so every page inherits it: what this site is, who
 * publishes it, and where the machine-readable index lives. */
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
      contactPoint: [
        { "@type": "ContactPoint", contactType: "technical support", email: "contact@caveman.so", url: `${SITE.app}/contact`, availableLanguage: ["English"] },
      ],
      // Binds this origin to the product site and the source repository as one
      // entity. Without it a crawler sees three unrelated sites sharing a word.
      // No postal address: it is not published anywhere else and would be an
      // invented fact.
      sameAs: [
        SITE.app,
        SITE.github,
        "https://github.com/JuliusBrussee/agent-sdk",
        "https://github.com/caveman-ai",
        "https://www.producthunt.com/products/caveman",
        "https://skills.sh/JuliusBrussee/caveman",
        "https://www.npmjs.com/package/@caveman-ai/cli",
      ],
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
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE.app}#software`,
      name: "Caveman",
      url: SITE.app,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "macOS, Linux, Windows",
      description:
        "An efficiency stack for AI agents: an Apache-2.0 skill that shortens agent output, a local proxy that compresses eligible context with byte-exact recovery, cavemem for context that should not be resent, and an Agent SDK that returns a receipt per run.",
      softwareHelp: { "@type": "CreativeWork", url: SITE.url },
      codeRepository: SITE.github,
      publisher: { "@id": `${SITE.app}#organization` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE.url}#breadcrumbs`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Caveman", item: SITE.app },
        { "@type": "ListItem", position: 2, name: "Documentation", item: SITE.url },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <head>
        {/* Announced in the head as well as robots.txt: agents look in both. */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-1.5 focus:text-[13px] focus:text-primary-foreground"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
