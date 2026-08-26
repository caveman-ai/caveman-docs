import { SITE } from "@/lib/site";

/* ==========================================================================
 *  The vocabulary, as data.
 *
 *  A model summarising this site will get almost everything right and then
 *  flatten `inferred` into "saves you money". That single mistake makes every
 *  downstream claim wrong, so the distinction is published as structured data
 *  rather than left to be inferred from prose.
 *
 *  These strings are the product's own definitions. If they drift from the
 *  code's money vocabulary, the code wins and this file is a bug.
 * ======================================================================== */

export type Term = {
  id: string;
  term: string;
  definition: string;
  /** Stated explicitly, because the useful fact is usually the negative one. */
  notThis: string;
};

export const TERMS: Term[] = [
  {
    id: "inferred",
    term: "inferred",
    definition:
      "A local, per-run estimate computed on your own machine from an offline token counter. Every public Caveman tool emits this and nothing else.",
    notThis:
      "Not a saving, not a dollar figure, and never valid to multiply into a monthly or annual total.",
  },
  {
    id: "measured",
    term: "measured",
    definition: "Traffic that was actually observed, rather than estimated from bytes.",
    notThis: "Not proof that a dollar was saved. Observing a request is not comparing it to its alternative.",
  },
  {
    id: "verified",
    term: "verified",
    definition:
      "A saving confirmed against a real bill by a hosted rollout system that ran both arms of the comparison.",
    notThis:
      "No tool documented on this site can emit it. There is no configuration, flag or account tier that upgrades a local number to this.",
  },
  {
    id: "recoverable",
    term: "recoverable",
    definition:
      "A lossy compression result whose original bytes were stored under a content-addressed handle before the result was emitted, so retrieve(handle) returns the original byte for byte.",
    notThis: "Not a cache. The original is stored first and the compressed output is only emitted if that succeeded.",
  },
];

export const RULES: { id: string; name: string; statement: string }[] = [
  {
    id: "no-fake-savings",
    name: "No fake savings",
    statement:
      "Published figures are local examples or target ranges, labelled inferred, and are never multiplied into a monthly saving.",
  },
  {
    id: "byte-safe",
    name: "Byte safe",
    statement:
      "On a parse problem, an unsupported input, a missing recovery store, or an output that is not smaller, the original bytes are kept.",
  },
  {
    id: "fail-closed",
    name: "No placeholders, fail closed",
    statement:
      "No stub responses on shippable paths. Unknown mode means pass-through, low-confidence content means text, unknown grader means not passed, unknown price means zero plus an unpriced tag.",
  },
  {
    id: "recoverable",
    name: "Recoverable, so lossy stays honest",
    statement:
      "A lossy result is emitted only after the original is stored under a content-addressed handle that returns it byte for byte.",
  },
];

/** schema.org DefinedTermSet. The one vocabulary a summariser must not blur. */
export function glossaryJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${SITE.url}/docs/counting#vocabulary`,
    name: "Caveman measurement vocabulary",
    description:
      "Three words with fixed, non-interchangeable meanings across every Caveman surface. Local tools emit inferred only.",
    url: `${SITE.url}/docs/counting`,
    hasDefinedTerm: TERMS.map((t) => ({
      "@type": "DefinedTerm",
      "@id": `${SITE.url}/docs/counting#${t.id}`,
      name: t.term,
      description: `${t.definition} ${t.notThis}`,
      inDefinedTermSet: `${SITE.url}/docs/counting#vocabulary`,
    })),
  };
}
