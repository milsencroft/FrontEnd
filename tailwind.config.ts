import type { Config } from "tailwindcss";
// Colour tokens are defined once in app/globals.css (CSS variables). Components use these names only.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "rgb(var(--c-ivory) / <alpha-value>)", charcoal: "rgb(var(--c-charcoal) / <alpha-value>)",
        sage: "rgb(var(--c-sage) / <alpha-value>)", bronze: "rgb(var(--c-bronze) / <alpha-value>)",
        brass: "rgb(var(--c-brass) / <alpha-value>)", stone: "rgb(var(--c-stone) / <alpha-value>)", white: "rgb(var(--c-white) / <alpha-value>)",
        danger: "rgb(var(--c-danger) / <alpha-value>)",
        bone: "rgb(var(--c-bone) / <alpha-value>)", kerala: "rgb(var(--c-kerala) / <alpha-value>)", japan: "rgb(var(--c-japan) / <alpha-value>)",
      },
      fontFamily: { serif: ["var(--font-serif)"], sans: ["var(--font-sans)"] },
    },
  },
  plugins: [],
};
export default config;
