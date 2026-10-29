import { getPages, getProduct } from "@/lib/content";
import type { SearchRecord } from "@/lib/search-types";

export const dynamic = "force-static";

/* The ⌘K index: built once at build time from the same compiled pages the
 * site renders, so every heading result carries an anchor that exists. */
export function GET() {
  const records: SearchRecord[] = getPages().map((page) => ({
    href: page.href,
    title: page.title,
    navTitle: page.navTitle,
    description: page.description,
    product: page.product,
    productName: getProduct(page.product)?.name ?? page.product,
    group: page.group,
    headings: page.headings.map(({ id, text }) => ({ id, text })),
  }));
  return Response.json(records, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=86400" } });
}
