/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        shell: token("shell"),
        background: token("background"),
        foreground: token("foreground"),
        card: token("card"),
        popover: token("popover"),
        primary: { DEFAULT: token("primary"), foreground: token("primary-foreground") },
        secondary: token("secondary"),
        muted: { DEFAULT: token("muted"), foreground: token("muted-foreground") },
        accent: token("accent"),
        border: token("border"),
        input: token("input"),
        ring: token("ring"),
        sidebar: { foreground: token("sidebar-foreground"), accent: token("sidebar-accent") },
        success: token("success"),
        warning: token("warning"),
        destructive: token("destructive"),
      },
      borderRadius: { panel: "12px", card: "14px", xl: "0.75rem", lg: "0.5rem", md: "0.375rem" },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: { "2xs": ["0.6875rem", { lineHeight: "1rem" }] },
      boxShadow: { overlay: "var(--shadow-overlay)", frame: "var(--shadow-frame)" },
      width: { sidebar: "var(--sidebar-width)" },
      spacing: { sidebar: "var(--sidebar-width)" },
    },
  },
  plugins: [],
};
