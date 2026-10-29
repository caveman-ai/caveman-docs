/* ==========================================================================
 *  Mintlify MDX to plain Markdown.
 *
 *  The Markdown mirror is generated from the same `.mdx` file the HTML page
 *  renders from, so there is no second copy to drift. This module turns the
 *  Mintlify components into the plain Markdown a reader without JSX expects:
 *
 *    <CardGroup> / <Card title href>   a link list, one item per card, with
 *                                      the card's text after the link
 *    <Steps> / <Step title>            "**Step 1: title**" and the step body
 *    <AccordionGroup> / <Accordion>    "**title**" and the body
 *    <Tabs> / <Tab title>              "**title**" and the body
 *    <CodeGroup>                       the fences, unchanged
 *    <Note> <Tip> <Info> <Warning>     a blockquote with a bold label
 *    <Check> <Danger>
 *    {/* comments *\/}                 removed
 *
 *  Two rules make it safe:
 *
 *  1. Code fences are copied as they are, JSX-looking text included. Nothing
 *     inside a fence is ever read as a component or a comment.
 *
 *  2. Component bodies are dedented. Mintlify indents children by two to six
 *     spaces, and MDX has no indented code blocks, so that is harmless in the
 *     source. In plain Markdown four spaces starts a code block, so a Step body
 *     left indented would turn into one. Each body loses its common
 *     indentation, measured on its prose and fence lines (not on fence
 *     content, which may legitimately sit further left), and is then converted
 *     again as a document of its own, so nesting works to any depth. A fence
 *     inside a Step comes out with the same code MDX would render.
 *
 *  Component tags are recognised on lines of their own (`<Step title="x">`,
 *  `</Step>`, `<Card ... />`) or as one complete line (`<Note>text</Note>`),
 *  which is how every page in this repository writes them. An unknown
 *  component is unwrapped: its tags go, its body stays, and a `title` becomes
 *  a bold line. Nothing with words in it is dropped.
 *
 *  No imports, so tests can load it without a bundler.
 * ======================================================================== */

const CALLOUTS = new Set(["Note", "Tip", "Info", "Warning", "Check", "Danger"]);
/** Containers whose own tags carry nothing worth keeping. */
const UNWRAP = new Set(["CardGroup", "Columns", "AccordionGroup", "Tabs", "CodeGroup", "Frame"]);

type Attrs = Record<string, string>;

interface Fence {
  char: string;
  length: number;
}

interface Tag {
  indent: number;
  name: string;
  attrs: Attrs;
  selfClosing: boolean;
  /** Body text when the whole component sits on one line. */
  inline?: string;
}

interface Context {
  /** Set while converting the direct body of a <Steps>, so each <Step> is numbered. */
  steps?: { count: number };
}

const ATTRS = String.raw`((?:\s+[\w-]+(?:=(?:"[^"]*"|'[^']*'|\{[^}]*\}))?)*)`;
const OPEN = new RegExp(String.raw`^(\s*)<([A-Z][A-Za-z0-9]*)${ATTRS}\s*(\/?)>\s*$`);
const ONE_LINE = new RegExp(String.raw`^(\s*)<([A-Z][A-Za-z0-9]*)${ATTRS}\s*>(.*)<\/\2>\s*$`);
const CLOSE = /^\s*<\/([A-Z][A-Za-z0-9]*)>\s*$/;

function parseAttrs(source: string): Attrs {
  const attrs: Attrs = {};
  for (const m of source.matchAll(/([\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|\{([^}]*)\}))?/g)) {
    const [, key, double, single, expression] = m;
    if (!key) continue;
    let value = double ?? single ?? expression ?? "true";
    // {"text"} and {'text'} are strings written as expressions.
    const quoted = /^\s*(["'])(.*)\1\s*$/.exec(value);
    if (expression !== undefined && quoted) value = quoted[2] ?? "";
    attrs[key] = value;
  }
  return attrs;
}

function readTag(line: string): Tag | null {
  const one = ONE_LINE.exec(line);
  if (one) {
    return {
      indent: one[1]?.length ?? 0,
      name: one[2] ?? "",
      attrs: parseAttrs(one[3] ?? ""),
      selfClosing: false,
      inline: one[4] ?? "",
    };
  }
  const open = OPEN.exec(line);
  if (!open) return null;
  return {
    indent: open[1]?.length ?? 0,
    name: open[2] ?? "",
    attrs: parseAttrs(open[3] ?? ""),
    selfClosing: open[4] === "/",
  };
}

/** A fence opener: three or more backticks or tildes, at any indentation. */
function openFence(line: string): Fence | null {
  const m = /^\s*(`{3,}|~{3,})(.*)$/.exec(line);
  if (!m?.[1]) return null;
  // A backtick fence's info string cannot contain a backtick: "```x``` y" is inline code.
  if (m[1][0] === "`" && m[2]?.includes("`")) return null;
  return { char: m[1][0] ?? "`", length: m[1].length };
}

function closesFence(fence: Fence, line: string): boolean {
  const m = /^\s*(`{3,}|~{3,})\s*$/.exec(line);
  return Boolean(m?.[1] && m[1][0] === fence.char && m[1].length >= fence.length);
}

function leading(line: string): number {
  return /^ */.exec(line)?.[0].length ?? 0;
}

const isBlank = (line: string) => line.trim() === "";

/** Index of the line that closes the component opened just before `start`, or -1. */
function findClose(lines: string[], start: number, name: string): number {
  let depth = 0;
  let fence: Fence | null = null;
  for (let i = start; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (fence) {
      if (closesFence(fence, line)) fence = null;
      continue;
    }
    fence = openFence(line);
    if (fence) continue;
    const close = CLOSE.exec(line);
    if (close?.[1] === name) {
      if (depth === 0) return i;
      depth--;
      continue;
    }
    const tag = readTag(line);
    if (tag && tag.name === name && !tag.selfClosing && tag.inline === undefined) depth++;
  }
  return -1;
}

/** Remove the body's common indentation, measured outside fence content. */
function dedent(lines: string[]): string[] {
  let min = Infinity;
  let fence: Fence | null = null;
  for (const line of lines) {
    if (fence) {
      if (closesFence(fence, line)) {
        fence = null;
        min = Math.min(min, leading(line));
      }
      continue;
    }
    if (isBlank(line)) continue;
    min = Math.min(min, leading(line));
    fence = openFence(line);
  }
  if (!Number.isFinite(min) || min === 0) return lines;
  // Fence content less indented than `min` loses only what it has, which is
  // what MDX does when it strips a fence's indentation from its content.
  return lines.map((line) => line.slice(Math.min(min, leading(line))));
}

function indent(lines: string[], by: number): string[] {
  if (by <= 0) return lines;
  const pad = " ".repeat(by);
  return lines.map((line) => (line ? pad + line : line));
}

function trimBlank(lines: string[]): string[] {
  let start = 0;
  let end = lines.length;
  while (start < end && isBlank(lines[start] ?? "")) start++;
  while (end > start && isBlank(lines[end - 1] ?? "")) end--;
  return lines.slice(start, end);
}

/** Collapse runs of blank lines outside fences. Code keeps its blank lines. */
function tidy(lines: string[]): string[] {
  const out: string[] = [];
  let fence: Fence | null = null;
  for (const line of lines) {
    if (fence) {
      out.push(line);
      if (closesFence(fence, line)) fence = null;
      continue;
    }
    fence = openFence(line);
    if (isBlank(line)) {
      if (out.length > 0 && out[out.length - 1] !== "") out.push("");
      continue;
    }
    out.push(line);
  }
  return trimBlank(out);
}

/* Lines that cannot be folded into a list item's single line. */
const STRUCTURAL = /^\s*(?:[-*+]\s|\d+[.)]\s|#{1,6}\s|>|\||`{3,}|~{3,}|\*\*Step\b)/;

function card(attrs: Attrs, body: string[]): string[] {
  const label = attrs.title ?? attrs.href ?? "";
  const head = attrs.href ? `[${label}](${attrs.href})` : `**${label}**`;
  const text = trimBlank(body);
  if (text.length === 0) return [`- ${head}`];
  if (text.every((line) => isBlank(line) || !STRUCTURAL.test(line))) {
    const joined = text.filter((l) => !isBlank(l)).map((l) => l.trim()).join(" ");
    return [`- ${head}: ${joined}`];
  }
  // A card with a list or code in it keeps that structure under the item.
  return [`- ${head}`, "", ...indent(text, 2)];
}

function callout(name: string, attrs: Attrs, body: string[]): string[] {
  const label = attrs.title ? `${name}: ${attrs.title}` : name;
  const text = trimBlank(body);
  const quote = (lines: string[]) => lines.map((l) => (l ? `> ${l}` : ">"));
  const first = text[0];
  if (first !== undefined && !STRUCTURAL.test(first)) {
    return quote([`**${label}:** ${first.trim()}`, ...text.slice(1)]);
  }
  return quote([`**${label}**`, ...(text.length ? ["", ...text] : [])]);
}

function titled(title: string | undefined, body: string[]): string[] {
  const text = trimBlank(body);
  if (!title) return text;
  return [`**${title}**`, ...(text.length ? ["", ...text] : [])];
}

function render(tag: Tag, body: string[], ctx: Context): string[] {
  const { name, attrs } = tag;
  if (name === "Card") return card(attrs, body);
  if (CALLOUTS.has(name)) return callout(name, attrs, body);
  if (name === "Step") {
    const n = attrs.stepNumber ?? (ctx.steps ? String(++ctx.steps.count) : undefined);
    const label = n ? `Step ${n}` : "Step";
    return titled(attrs.title ? `${label}: ${attrs.title}` : label, body);
  }
  if (name === "CardGroup" || name === "Columns") {
    const text = trimBlank(body);
    // Cards separated by blank lines in the source read as one tight list.
    if (text.every((l) => isBlank(l) || l.startsWith("- "))) return text.filter((l) => !isBlank(l));
    return text;
  }
  if (UNWRAP.has(name) || name === "Steps") return trimBlank(body);
  // Accordion, Tab, and any component this file does not know: keep the body,
  // with its title as a bold line.
  return titled(attrs.title, body);
}

/* JSX comments, possibly spanning lines. Returns the line without them, or
 * null when the whole line was comment. */
function stripComments(line: string, state: { open: boolean }): string | null {
  let rest = line;
  let out = "";
  let touched = false;
  while (rest) {
    if (state.open) {
      const end = rest.indexOf("*/}");
      touched = true;
      if (end === -1) return out.trim() ? out : null;
      rest = rest.slice(end + 3);
      state.open = false;
      continue;
    }
    const start = rest.indexOf("{/*");
    if (start === -1) {
      out += rest;
      break;
    }
    out += rest.slice(0, start);
    rest = rest.slice(start + 3);
    state.open = true;
    touched = true;
  }
  if (touched && !out.trim()) return null;
  return touched ? out.trimEnd() : out;
}

function convert(lines: string[], ctx: Context, topLevel: boolean): string[] {
  const out: string[] = [];
  const comment = { open: false };
  let fence: Fence | null = null;
  let esm = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const afterBlank = i === 0 || isBlank(lines[i - 1] ?? "");

    if (fence) {
      out.push(line);
      if (closesFence(fence, line)) fence = null;
      continue;
    }

    // An ESM block (import/export starting a block at the top level of the
    // document) runs to the next blank line and has no Markdown meaning.
    if (esm) {
      if (isBlank(line)) esm = false;
      continue;
    }
    if (topLevel && afterBlank && !comment.open && /^(?:import|export)\s/.test(line)) {
      esm = true;
      continue;
    }

    const opened = !comment.open && openFence(line);
    if (opened) {
      fence = opened;
      out.push(line);
      continue;
    }

    const text = stripComments(line, comment);
    if (text === null) continue;

    const tag = readTag(text);
    if (tag) {
      let block: string[] | null = null;
      if (tag.inline !== undefined) {
        block = render(tag, convert([tag.inline], {}, false), ctx);
      } else if (tag.selfClosing) {
        block = tag.name === "Card" ? card(tag.attrs, []) : null;
        if (!block) {
          // A self-closing component this file cannot describe is left as written.
          out.push(text);
          continue;
        }
      } else {
        const end = findClose(lines, i + 1, tag.name);
        if (end !== -1) {
          const inner = dedent(lines.slice(i + 1, end));
          const childCtx: Context = tag.name === "Steps" ? { steps: { count: 0 } } : {};
          block = render(tag, convert(inner, childCtx, false), ctx);
          i = end;
        }
      }
      if (block) {
        out.push("", ...indent(block, tag.indent), "");
        continue;
      }
    }

    // A stray closing tag (its opener was not on a line of its own) is dropped.
    if (CLOSE.test(text)) continue;
    out.push(text);
  }

  return tidy(out);
}

/** Convert a Mintlify `.mdx` body (front matter already removed) to Markdown. */
export function toMarkdown(source: string): string {
  return convert(source.replace(/\r\n?/g, "\n").split("\n"), {}, true).join("\n");
}
