import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sidebar: {
          DEFAULT: "#0F172A",
          hover: "#1E293B",
          active: "#2563EB",
          text: "#94A3B8",
          textActive: "#FFFFFF",
        }
      },
    },
  },
  plugins: [],
};
export default config;
