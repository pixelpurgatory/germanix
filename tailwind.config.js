/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,js}"],
  // Preflight ships #e5e7eb (border default) and #9ca3af (::placeholder); the
  // shadow and ring plugins ship #fff, #0000 and a default blue ring colour.
  // None are reachable on this page but all land in the stylesheet, so they
  // are switched off and src/style.css carries its own reset instead.
  corePlugins: {
    preflight: false,
    boxShadow: false,
    boxShadowColor: false,
    ringWidth: false,
    ringColor: false,
    ringOffsetWidth: false,
    ringOffsetColor: false,
    ringOpacity: false,
    ringInset: false,
  },
  theme: {
    extend: {
      colors: {
        base: "#0A0A0B",
        surface: "#141416",
        hairline: "#26262A",
        text: "#EDEDEF",
        muted: "#8A8A93",
        accent: "#C4B5A0",
      },
      fontFamily: {
        sans: [
          "Inter Tight",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      letterSpacing: {
        tightest: "-0.03em",
        label: "0.12em",
      },
      maxWidth: {
        prose: "58ch",
      },
    },
  },
  plugins: [],
};
