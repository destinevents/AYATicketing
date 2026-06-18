import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pine: {
          DEFAULT: "#2B3228",
          deep: "#1D2219",
          mid: "#3A4436",
          light: "#4E5C49",
        },
        fog: {
          DEFAULT: "#F0EDE6",
          2: "#E8E4DC",
          warm: "#FAF8F4",
        },
        gold: {
          DEFAULT: "#C9A84C",
          light: "#DEC270",
        },
        moss: "#7A9B6A",
        terra: "#8B4A35",
        ink: "#1A1E18",
        muted: "#6B7864",
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
