import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { DocsShell } from "@/components/docs/shell";
import { DocsMobileNav } from "@/components/docs/mobile-nav";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader left={<DocsMobileNav />} />
      <main id="main">
        <DocsShell>{children}</DocsShell>
      </main>
      <SiteFooter />
    </>
  );
}
