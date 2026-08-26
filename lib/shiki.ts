import "server-only";
import { createHighlighter, type Highlighter, type ThemeRegistration } from "shiki";

/* ==========================================================================
 *  Shiki: build-time syntax highlighting.
 *
 *  One singleton highlighter and one bespoke theme, "Onyx", tuned to the same
 *  identity colours the console charts use: blue keywords, amber calls, green
 *  strings, purple types, on a transparent canvas so the card surface behind
 *  the block shows through. Server only, so no highlighting JavaScript ever
 *  reaches the reader.
 * ======================================================================== */

const FG = "#c9c9c9"; // calm mist for default code text
const onyx: ThemeRegistration = {
  name: "caveman-onyx",
  type: "dark",
  colors: {
    "editor.background": "#00000000",
    "editor.foreground": FG,
  },
  fg: FG,
  bg: "#00000000",
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment", "string.comment"], settings: { foreground: "#6b6b6b", fontStyle: "italic" } },
    {
      scope: [
        "keyword",
        "storage",
        "storage.type",
        "storage.modifier",
        "keyword.control",
        "keyword.operator.new",
        "keyword.operator.expression",
        "variable.language.this",
        "constant.language.import-export-all",
      ],
      settings: { foreground: "#7fa8e8" },
    },
    { scope: ["string", "string.quoted", "string.template", "constant.other.symbol"], settings: { foreground: "#7fbf95" } },
    { scope: ["punctuation.definition.string"], settings: { foreground: "#67a882" } },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call.generic", "variable.function"],
      settings: { foreground: "#d3a04a" },
    },
    {
      scope: ["constant.numeric", "constant.language.boolean", "constant.language.null", "constant.language.undefined", "support.constant"],
      settings: { foreground: "#63b8c4" },
    },
    {
      scope: ["entity.name.type", "entity.name.class", "support.type", "support.class", "entity.other.inherited-class", "entity.name.type.go"],
      settings: { foreground: "#a08de0" },
    },
    { scope: ["variable", "variable.other", "meta.definition.variable variable", "variable.parameter"], settings: { foreground: "#d6d6d6" } },
    {
      scope: ["support.type.property-name", "meta.object-literal.key", "variable.object.property", "meta.structure.dictionary.key string"],
      settings: { foreground: "#bdbdbd" },
    },
    { scope: ["keyword.operator", "punctuation", "meta.brace", "punctuation.separator", "punctuation.terminator"], settings: { foreground: "#8c8c8c" } },
    { scope: ["entity.name.tag", "punctuation.definition.tag"], settings: { foreground: "#7fa8e8" } },
    { scope: ["entity.other.attribute-name"], settings: { foreground: "#d3a04a" } },
    { scope: ["constant.character.escape", "constant.other.placeholder"], settings: { foreground: "#63b8c4" } },
    { scope: ["string.regexp"], settings: { foreground: "#7fbf95" } },
    { scope: ["markup.inserted", "punctuation.definition.inserted"], settings: { foreground: "#7fa8e8" } },
    { scope: ["markup.deleted", "punctuation.definition.deleted"], settings: { foreground: "#e5636a" } },
    { scope: ["markup.heading", "entity.name.section"], settings: { foreground: "#7fa8e8", fontStyle: "bold" } },
    { scope: ["markup.bold"], settings: { fontStyle: "bold" } },
    { scope: ["markup.italic"], settings: { fontStyle: "italic" } },
    { scope: ["source.shell", "meta.scope.prerequisites"], settings: { foreground: FG } },
  ],
};

export const DOC_LANGS = [
  "bash",
  "shell",
  "typescript",
  "tsx",
  "javascript",
  "jsx",
  "python",
  "go",
  "json",
  "jsonc",
  "yaml",
  "toml",
  "diff",
  "http",
  "dockerfile",
  "sql",
  "markdown",
  "html",
  "css",
  "ini",
  "text",
] as const;

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [onyx],
      langs: DOC_LANGS as unknown as string[],
    });
  }
  return highlighterPromise;
}

const ALIAS: Record<string, string> = {
  sh: "bash",
  zsh: "bash",
  shell: "bash",
  ts: "typescript",
  js: "javascript",
  py: "python",
  golang: "go",
  yml: "yaml",
  curl: "bash",
  console: "bash",
  txt: "text",
  "": "text",
};

/** Highlight `code` as themed HTML (the inner <code> only — we supply our own <pre>). */
export async function highlightCode(code: string, lang: string): Promise<string> {
  const resolved = ALIAS[lang] ?? lang;
  const hl = await getHighlighter();
  const supported = hl.getLoadedLanguages().includes(resolved) ? resolved : "text";
  return hl.codeToHtml(code.replace(/\n$/, ""), {
    lang: supported,
    theme: "caveman-onyx",
    structure: "inline",
  });
}
