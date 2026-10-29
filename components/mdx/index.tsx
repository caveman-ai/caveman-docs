import type { MDXComponents } from "mdx/types";
import { CodeGroup, Pre } from "@/components/mdx/code";
import {
  Accordion,
  AccordionGroup,
  Anchor,
  Card,
  CardGroup,
  Check,
  Danger,
  Info,
  Note,
  Step,
  Steps,
  Tab,
  Table,
  Tabs,
  Tip,
  Warning,
  heading,
} from "@/components/mdx/blocks";

/* Every element and Mintlify component a page may use. A page that uses a
 * component missing here fails the build with its name, rather than shipping
 * with a hole in it. */
export const mdxComponents: MDXComponents = {
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),
  a: Anchor,
  pre: Pre,
  table: Table,

  Accordion,
  AccordionGroup,
  Card,
  CardGroup,
  Check,
  CodeGroup,
  Danger,
  Info,
  Note,
  Step,
  Steps,
  Tab,
  Tabs,
  Tip,
  Warning,
};
