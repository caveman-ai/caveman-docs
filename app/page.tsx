import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { StackDiagram, RequestPath } from "@/components/docs/diagrams";
import { DOCS_NAV, LAYERS, docPath, type DocLink } from "@/lib/docs-nav";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Caveman documentation",
  description: SITE.description,
  alternates: { canonical: "/" },
};

/* The four rules the code follows, stated on the front page rather than buried,
 * because they are the reason to trust anything else here. Each links to the
 * section that explains it. */
const RULES: [string, string, string][] = [
  ["No fake savings", "Local figures stay labelled inferred and are never multiplied into a monthly number.", "#1-no-fake-savings"],
  ["Byte safe", "On any error, unsupported input, or result that is not smaller, the original bytes are kept.", "#2-byte-safe"],
  ["Fail closed", "Every unknown case resolves toward doing less. Unknown mode means pass-through.", "#3-no-placeholders-fail-closed"],
  ["Recoverable", "Nothing lossy is emitted until the original is stored and can be fetched back exactly.", "#4-recoverable-so-lossy-stays-honest"],
];

const AGENT_ENDPOINTS: [string, string][] = [
  ["/llms.txt", "Every page with a one-line summary, grouped by layer."],
  ["/llms-full.txt", "The full text of the whole site in one file."],
  ["/docs/engine.md", "Any page as plain Markdown. Append .md to the path."],
  ["/sitemap.xml", "Machine-readable index of everything that exists."],
];

function SectionHead({ label, title, children }: { label: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="font-mono text-2xs text-muted-foreground">{label}</p>
      <h2 className="mt-1.5 text-lg font-medium tracking-[-0.01em] text-foreground">{title}</h2>
      {children ? <p className="mt-2 max-w-measure text-[14px] leading-relaxed text-muted-foreground">{children}</p> : null}
    </div>
  );
}

function PageLink({ doc }: { doc: DocLink }) {
  return (
    <li>
      <Link
        href={docPath(doc.slug)}
        className="group flex items-baseline gap-2 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="text-foreground/90 group-hover:text-foreground">{doc.title}</span>
        <span className="min-w-0 flex-1 truncate">{doc.blurb}</span>
      </Link>
    </li>
  );
}

export default function HomePage() {
  const groups = Object.fromEntries(DOCS_NAV.map((g) => [g.title, g]));
  const start = groups["Start"]?.items.filter((i) => i.slug !== "") ?? [];
  const reference = groups["Reference"]?.items.filter((i) => !i.soon) ?? [];

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8">
        {/* ---------------------------------------------------------------- */}
        <section className="border-b border-border py-14 lg:py-20">
          <p className="font-mono text-2xs text-muted-foreground">docs.caveman.so</p>
          <h1 className="mt-4 max-w-[22ch] text-[34px] font-medium leading-[1.12] tracking-[-0.03em] text-foreground sm:text-[44px]">
            Documentation for the parts of Caveman you run yourself.
          </h1>
          <p className="mt-5 max-w-measure text-[15px] leading-relaxed text-muted-foreground">
            Caveman is an efficiency stack for AI agents. Four layers sit between your agent and the bill it
            generates. Three of them run on your machine and are open. This site documents those, and says
            plainly what each one can and cannot prove.
          </p>

          <StackDiagram />

          <div className="flex flex-wrap gap-2">
            <Link
              href="/docs/quickstart"
              className="flex h-9 items-center gap-2 rounded-md bg-primary px-3.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              Start here
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
            <Link
              href="/docs"
              className="flex h-9 items-center rounded-md border border-input px-3.5 text-[13px] transition-colors hover:bg-accent"
            >
              Read the overview
            </Link>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section className="border-b border-border py-12">
          <SectionHead label="in one picture" title="What happens to a request">
            The skill shapes what the agent writes. The engine reduces what leaves. The dashed path is the
            part that makes the rest safe: anything the engine removed can be fetched back exactly.
          </SectionHead>
          <RequestPath />
        </section>

        {/* ---------------------------------------------------------------- */}
        <section className="border-b border-border py-12">
          <SectionHead label="get going" title="First three pages" />
          <div className="grid gap-3 sm:grid-cols-3">
            {start.map((doc) => (
              <Link
                key={doc.slug}
                href={docPath(doc.slug)}
                className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
              >
                <div className="text-[13px] font-medium text-foreground">{doc.title}</div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{doc.blurb}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section className="border-b border-border py-12">
          <SectionHead label="by layer" title="Everything, in stack order">
            Each layer is independent. Nothing above one is required by the one below it.
          </SectionHead>
          <div className="grid gap-x-8 gap-y-6 lg:grid-cols-2">
            {LAYERS.map((layer) => {
              const group = DOCS_NAV.find((g) => g.layer === layer.id);
              if (!group) return null;
              return (
                <div key={layer.id} className="border-t border-border pt-4">
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-mono text-2xs tabular-nums text-ember">
                      {String(layer.rank).padStart(2, "0")}
                    </span>
                    <Link href={docPath(layer.id)} className="text-[13px] font-medium text-foreground hover:underline">
                      {layer.name}
                    </Link>
                    <span className="text-[13px] text-muted-foreground">{layer.role}</span>
                  </div>
                  <ul className="mt-2">
                    {group.items.map((item) =>
                      item.soon ? (
                        <li key={item.slug} className="flex items-baseline gap-2 py-1.5 text-[13px] text-muted-foreground/50">
                          <span>{item.title}</span>
                          <span className="min-w-0 flex-1 truncate">{item.blurb}</span>
                          <span className="shrink-0 text-2xs">soon</span>
                        </li>
                      ) : (
                        <PageLink key={item.slug} doc={item} />
                      ),
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section className="border-b border-border py-12">
          <SectionHead label="the part worth reading twice" title="What the numbers are allowed to say">
            Every local tool reports <code className="font-mono text-[13px] text-foreground">inferred</code>, meaning a
            per-run estimate computed on your machine. Nothing here can emit{" "}
            <code className="font-mono text-[13px] text-foreground">verified</code>, and no setting changes that.
          </SectionHead>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {RULES.map(([title, body, anchor], i) => (
              <Link
                key={title}
                href={`/docs/counting${anchor}`}
                className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xs tabular-nums text-muted-foreground">{i + 1}</span>
                  <span className="text-[13px] font-medium text-foreground">{title}</span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section className="border-b border-border py-12">
          <SectionHead label="for agents" title="This site is readable without a browser">
            Every page is also plain text. You do not need to parse the HTML, and there is no separate
            copy to go stale: the Markdown is generated from the same source the page renders from.
          </SectionHead>
          <dl className="max-w-measure divide-y divide-border rounded-xl border border-border">
            {AGENT_ENDPOINTS.map(([path, what]) => (
              <div key={path} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
                <dt className="w-44 shrink-0">
                  <a
                    href={path}
                    className="font-mono text-xs text-foreground underline decoration-border underline-offset-[3px] hover:decoration-foreground"
                  >
                    {path}
                  </a>
                </dt>
                <dd className="text-[13px] text-muted-foreground">{what}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section className="py-12">
          <SectionHead label="the fine print, up front" title="Licensing and telemetry" />
          <div className="grid gap-3 sm:grid-cols-2">
            {reference.map((doc) => (
              <Link
                key={doc.slug}
                href={docPath(doc.slug)}
                className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
              >
                <div className="text-[13px] font-medium text-foreground">{doc.title}</div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{doc.blurb}</p>
              </Link>
            ))}
            <a
              href={SITE.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
            >
              <div className="flex items-baseline gap-1.5 text-[13px] font-medium text-foreground">
                Source
                <ArrowUpRight className="size-3.5 self-center text-muted-foreground" aria-hidden />
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                The public repository. Everything documented here is in it.
              </p>
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
