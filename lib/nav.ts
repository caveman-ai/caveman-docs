/* The navigation as the browser sees it: plain data built on the server from
 * `docs.json` (see `getNav` in lib/content.ts) and handed to the sidebar and
 * search. Client-safe: no fs, no server-only imports. */

export interface NavLink {
  href: string;
  title: string;
}

export interface NavGroupData {
  name: string;
  pages: NavLink[];
}

export interface NavTabData {
  name: string | null;
  href: string;
  groups: NavGroupData[];
}

export interface NavProduct {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  tabs: NavTabData[];
}

/* What docs.json cannot say: the one-word answer to "which product is this?"
 * shown beside every product name, and where that product lives outside the
 * docs. Keyed by product id (`docs.json` name minus "Caveman"). */
export const PRODUCT_META: Record<string, { tag: string; where: string; link: { label: string; href: string } }> = {
  caveman: {
    tag: "Open source",
    where: "Runs on your machine",
    link: { label: "GitHub", href: "https://github.com/JuliusBrussee/caveman" },
  },
  cloud: {
    tag: "Hosted",
    where: "Managed for your team",
    link: { label: "Open console", href: "https://app.caveman.so" },
  },
};

/** The product, tab and page a path belongs to, if it is a docs page. */
export function locate(nav: NavProduct[], pathname: string) {
  const path = pathname !== "/" ? pathname.replace(/\/$/, "") : pathname;
  for (const product of nav) {
    for (const tab of product.tabs) {
      for (const group of tab.groups) {
        if (group.pages.some((p) => p.href === path)) return { product, tab, group };
      }
    }
  }
  return null;
}
