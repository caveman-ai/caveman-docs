/* Components that are purely visual carry no words worth mirroring. Named
 * rather than pattern-matched so a component with real content in it can never
 * be silently dropped. */
const VISUAL_ONLY: Record<string, string> = {
  StackDiagram: "[Diagram: the four layers of the stack, bottom to top: Skill, Engine, Memory, Cloud.]",
  RequestPath: "[Diagram: one request, from your agent through the skill and the engine to the provider, with a recovery path back.]",
  OpenCoreBoundary: "[Diagram: the licence split across MIT, Apache-2.0, BSL 1.1 and Commercial surfaces.]",
  ProxyPath: "[Diagram: one request through the local proxy, from your agent to the engine to the provider, with recovery back from the CCR store.]",
};

/* A <Facts> row is authored as ["label", value]. In the mirror it reads better
 * as a definition line. A row whose value is JSX rather than a string is left
 * exactly as written: guessing at its text would be a worse answer than
 * showing the source. */
function factsRow(line: string): string | null {
  const row = /^\s*\[\s*"([^"]+)"\s*,\s*(.+?)\s*\]\s*,?\s*$/.exec(line);
  if (!row?.[1] || !row[2]) return null;
  const value = row[2];
  const asString = /^"(.*)"$/.exec(value);
  if (asString) return `- ${row[1]}: ${asString[1]}`;
  // Strip JSX tags but keep their text, so <code>x</code> becomes `x`.
  const text = value
    .replace(/<code[^>]*>(.*?)<\/code>/g, "`$1`")
    .replace(/<\/?([A-Za-z][^>]*)?>/g, "")
    .trim();
  return text ? `- ${row[1]}: ${text}` : null;
}

export function toMarkdown(source: string): string {
  const out: string[] = [];
  let inFacts = false;
  let fence: { marker: string; length: number } | undefined;

  for (const line of source.split("\n")) {
    const delimiter = /^\s{0,3}(`{3,}|~{3,})/.exec(line)?.[1];
    if (fence) {
      out.push(line);
      if (delimiter?.[0] === fence.marker && delimiter.length >= fence.length &&
          line.trim() === delimiter) fence = undefined;
      continue;
    }
    if (delimiter) {
      fence = { marker: delimiter[0]!, length: delimiter.length };
      out.push(line);
      continue;
    }
    if (/^\s*(import|export)\s/.test(line)) continue;
    if (/^\s*<DocSchema\b/.test(line)) continue;

    if (/^\s*<Facts\s+rows=\{\[/.test(line)) {
      inFacts = true;
      continue;
    }
    if (inFacts) {
      if (/^\s*\]\}\s*\/>\s*$/.test(line)) {
        inFacts = false;
        out.push("");
        continue;
      }
      const row = factsRow(line);
      out.push(row ?? line);
      continue;
    }

    const visual = /^\s*<(\w+)\s*\/>\s*$/.exec(line);
    const replacement = visual?.[1] ? VISUAL_ONLY[visual[1]] : undefined;
    if (replacement) {
      out.push(replacement);
      continue;
    }
    const card = /<Card\s[^>]*href="([^"]+)"[^>]*title="([^"]+)"[^>]*>/.exec(line);
    if (card) {
      out.push(`\n[${card[2]}](${card[1]})`);
      continue;
    }
    const note = /<Note\b[^>]*title="([^"]+)"[^>]*>/.exec(line);
    if (note) {
      out.push(`\n**${note[1]}**`);
      continue;
    }
    // Keep authored diagram text and captions, remove presentational JSX.
    out.push(line
      .replace(/<\/?>(?!>)/g, "")
      .replace(/<code\b[^>]*>(.*?)<\/code>/g, "`$1`")
      .replace(/<\/?(?:div|span|figure|figcaption|strong|em|p|Note|Steps|CardGrid|Card|Badge)\b[^>]*>/g, "")
      .trimEnd());
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
