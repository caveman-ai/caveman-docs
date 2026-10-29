import "server-only";
import docsConfig from "@/docs.json";
import generatedContent from "@/.generated/content.json";
import type { Heading } from "@/lib/mdx";
import type { NavProduct } from "@/lib/nav";

/* ==========================================================================
 *  The content index.
 *
 *  `docs.json` and the `.mdx` files beside it are the Mintlify source, and
 *  they stay the source: writers keep editing them exactly as before, and
 *  this site renders them. The navigation (products, tabs, groups, page
 *  order) comes from `docs.json`; each page's title, sidebar title and
 *  description come from its own front matter. Nothing is restated here.
 *
 *  Everything that lists pages (sidebar, pager, search, sitemap, llms.txt,
 *  the Markdown mirror) reads this module, so a page added to `docs.json`
 *  appears everywhere at once and a page missing from disk stops the build.
 *
 *  Nothing here touches the filesystem: the site runs on Workers, which have
 *  none. `scripts/build-content.mjs` reads the front matter, bodies, anchors
 *  and commit dates before every dev, build and type-check run, and this
 *  module imports the result.
 * ======================================================================== */

interface GeneratedPage {
  title: string;
  sidebarTitle?: string;
  description?: string;
  body: string;
  headings: Heading[];
  updated?: string;
}

const generated = generatedContent as unknown as { siteUpdated?: string; pages: Record<string, GeneratedPage> };

/** Mintlify serves its root page, the Cloud introduction, at `/`. Our root is
 * the product chooser, so the Cloud introduction moves to `/cloud`, where the
 * Caveman introduction's `/caveman` already sets the pattern. */
const ROOT_PAGE_HREF = "/cloud";

export type ProductId = string;

export interface DocPage {
  /** The Mintlify page path from docs.json, e.g. `caveman/quickstart`. */
  slug: string;
  /** The URL path this site serves it at, e.g. `/caveman/quickstart`. */
  href: string;
  /** Repository-relative source file. */
  file: string;
  /** Full title from front matter, used for `<title>` and the page heading. */
  title: string;
  /** Short title from `sidebarTitle`, used in navigation. */
  navTitle: string;
  description: string;
  product: ProductId;
  tab: string | null;
  group: string;
  /** Its h2/h3 anchors, in order. */
  headings: Heading[];
  /** ISO date of the last commit touching the file; absent when git cannot say. */
  updated: string | undefined;
}

export interface NavGroup {
  name: string;
  pages: DocPage[];
}

export interface NavTab {
  /** `null` for a product without tabs: it has one implicit tab. */
  name: string | null;
  href: string;
  groups: NavGroup[];
}

export interface Product {
  id: ProductId;
  name: string;
  description: string;
  icon: string;
  href: string;
  tabs: NavTab[];
}

interface MintlifyGroup {
  group: string;
  pages: (string | MintlifyGroup)[];
}
interface MintlifyTab {
  tab: string;
  groups: MintlifyGroup[];
}
interface MintlifyProduct {
  product: string;
  icon?: string;
  description?: string;
  groups?: MintlifyGroup[];
  tabs?: MintlifyTab[];
}

/** `caveman/index` → `/caveman`, `index` → the Cloud introduction's path. */
export function hrefForSlug(slug: string): string {
  if (slug === "index") return ROOT_PAGE_HREF;
  return "/" + slug.replace(/(^|\/)index$/, "");
}

/** "Caveman" → `caveman`, "Caveman Cloud" → `cloud`. */
function productId(name: string): ProductId {
  const rest = name.trim().toLowerCase().replace(/^caveman\s+/, "");
  return rest.replace(/[^a-z0-9]+/g, "-");
}

function readPage(slug: string, product: ProductId, tab: string | null, group: string): DocPage {
  const data = generated.pages[slug];
  if (!data) throw new Error(`docs.json lists "${slug}" but the content build has no such page. Run: node scripts/build-content.mjs`);
  return {
    slug,
    href: hrefForSlug(slug),
    file: `${slug}.mdx`,
    title: data.title,
    navTitle: data.sidebarTitle ?? data.title,
    description: data.description ?? "",
    product,
    tab,
    group,
    headings: data.headings,
    updated: data.updated,
  };
}

/** Nested Mintlify groups flatten into their parent: the sidebar is two levels
 * deep by design, and no page is dropped for being nested. */
function readGroup(group: MintlifyGroup, product: ProductId, tab: string | null): NavGroup {
  const pages: DocPage[] = [];
  for (const entry of group.pages) {
    if (typeof entry === "string") pages.push(readPage(entry, product, tab, group.group));
    else pages.push(...readGroup(entry, product, tab).pages);
  }
  return { name: group.group, pages };
}

function build(): { products: Product[]; pages: DocPage[] } {
  const config = docsConfig as { navigation: { products: MintlifyProduct[] } };

  const products = config.navigation.products.map((p): Product => {
    const id = productId(p.product);
    const rawTabs: { name: string | null; groups: MintlifyGroup[] }[] = p.tabs
      ? p.tabs.map((t) => ({ name: t.tab, groups: t.groups }))
      : [{ name: null, groups: p.groups ?? [] }];
    const tabs = rawTabs.map((t): NavTab => {
      const groups = t.groups.map((g) => readGroup(g, id, t.name));
      const first = groups[0]?.pages[0];
      if (!first) throw new Error(`docs.json: ${p.product} / ${t.name ?? "(default tab)"} has no pages.`);
      return { name: t.name, href: first.href, groups };
    });
    return {
      id,
      name: p.product,
      description: p.description ?? "",
      icon: p.icon ?? "book-open",
      href: tabs[0]!.href,
      tabs,
    };
  });

  const pages = products.flatMap((p) => p.tabs.flatMap((t) => t.groups.flatMap((g) => g.pages)));

  const seen = new Map<string, string>();
  for (const page of pages) {
    const prior = seen.get(page.href);
    if (prior) throw new Error(`docs.json: "${prior}" and "${page.slug}" both resolve to ${page.href}.`);
    seen.set(page.href, page.slug);
  }

  return { products, pages };
}

let index: ReturnType<typeof build> | undefined;
function content() {
  index ??= build();
  return index;
}

export function getProducts(): Product[] {
  return content().products;
}

export function getProduct(id: ProductId): Product | undefined {
  return content().products.find((p) => p.id === id);
}

/** Every page in reading order: product by product, tab by tab, group by group. */
export function getPages(): DocPage[] {
  return content().pages;
}

export function getPage(slug: string): DocPage | undefined {
  return content().pages.find((p) => p.slug === slug);
}

export function getPageByHref(href: string): DocPage | undefined {
  const normalized = href === "/" ? href : href.replace(/\/$/, "");
  return content().pages.find((p) => p.href === normalized);
}

/** The page's `.mdx` body, front matter removed. */
export function readPageSource(page: DocPage): string {
  return generated.pages[page.slug]?.body ?? "";
}

/** The newest commit date across all pages, if git could say. */
export function siteUpdated(): string | undefined {
  return generated.siteUpdated;
}

/** The navigation as plain data for client components. */
export function getNav(): NavProduct[] {
  return getProducts().map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    icon: p.icon,
    href: p.href,
    tabs: p.tabs.map((t) => ({
      name: t.name,
      href: t.href,
      groups: t.groups.map((g) => ({ name: g.name, pages: g.pages.map((pg) => ({ href: pg.href, title: pg.navTitle })) })),
    })),
  }));
}

/** Previous and next page inside the same product tab, in sidebar order. */
export function getNeighbours(page: DocPage): { prev: DocPage | undefined; next: DocPage | undefined } {
  const tab = getProduct(page.product)?.tabs.find((t) => t.name === page.tab);
  const order = tab?.groups.flatMap((g) => g.pages) ?? [];
  const i = order.findIndex((p) => p.slug === page.slug);
  return { prev: i > 0 ? order[i - 1] : undefined, next: i >= 0 ? order[i + 1] : undefined };
}
