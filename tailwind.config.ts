import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#1e40af", light: "#3b82f6", dark: "#1e3a8a" },
        accent: "#0ea5e9",
        success: "#16a34a",
        warning: "#f59e0b",
        danger: "#dc2626",
        surface: { DEFAULT: "#f8fafc", 2: "#f1f5f9" },
        border: "#e2e8f0",
        text: { DEFAULT: "#0f172a", secondary: "#64748b" },
      },
    },
  },
  plugins: [],
};

export default config;
