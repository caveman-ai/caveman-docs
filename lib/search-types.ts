/** One page in `/search-index.json`. */
export interface SearchRecord {
  href: string;
  title: string;
  navTitle: string;
  description: string;
  product: string;
  productName: string;
  group: string;
  headings: { id: string; text: string }[];
}
