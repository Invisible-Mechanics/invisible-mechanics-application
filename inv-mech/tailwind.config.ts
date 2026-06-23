import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0b0e",
        paper: "#fafafa",
        surface: "#ffffff",
        line: "#e7e7ec",
        brand: {
          50: "#f3f0ff",
          100: "#e9e3ff",
          200: "#d6caff",
          300: "#b9a5ff",
          400: "#9b7dff",
          500: "#7c5bff",
          600: "#6a47f0",
          700: "#5a39d6",
          800: "#4a2eb0",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,16,24,0.04), 0 1px 3px rgba(16,16,24,0.06)",
        "card-hover": "0 2px 6px rgba(16,16,24,0.06), 0 8px 24px rgba(16,16,24,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
