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
          DEFAULT: "#1C1C1A",
          deep: "#111110",
          mid: "#2E2E2C",
          light: "#444442",
        },
        fog: {
          DEFAULT: "#EDE8DF",
          2: "#E4DED5",
          warm: "#FAF8F4",
        },
        gold: {
          DEFAULT: "#C9A84C",
          light: "#DEC270",
        },
        moss: "#7A9B6A",
        terra: "#8B4A35",
        ink: "#1A1A18",
        muted: "#8A8480",
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
