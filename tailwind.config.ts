import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pine: {
          DEFAULT: "#241408",
          deep: "#160C04",
          mid: "#3A2010",
          light: "#5A3820",
        },
        fog: {
          DEFAULT: "#EDE8DC",
          2: "#E4DDD0",
          warm: "#F5F1EA",
        },
        gold: {
          DEFAULT: "#C9A84C",
          light: "#DEC270",
        },
        moss: "#7A9B6A",
        terra: {
          DEFAULT: "#B55230",
          light: "#C96840",
          deep: "#8B3E22",
        },
        ink: "#1E1208",
        muted: "#8A7A6E",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};
export default config;
