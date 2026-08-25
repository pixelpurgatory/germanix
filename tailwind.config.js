/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,js}"],
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
