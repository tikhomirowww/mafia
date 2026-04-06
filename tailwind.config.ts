import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#0D0D0D",
        "bg-card": "#1A1A1A",
        "bg-elevated": "#222222",
        "red-deep": "#8B0000",
        "red-mid": "#C0392B",
        "red-neon": "#DC143C",
        "text-muted": "#A0A0A0",
        "text-dim": "#555555",
        "gold": "#C9A84C",
        "gold-light": "#E8C96C",
        "gold-dim": "#6B5420",
      },
      fontFamily: {
        cinzel: ["Cinzel", "serif"],
        inter: ["Inter", "sans-serif"],
      },
      animation: {
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "slide-up": "slide-up 0.5s ease-out",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(255,34,34,0.3), 0 0 40px rgba(255,34,34,0.1)",
          },
          "50%": {
            boxShadow: "0 0 40px rgba(255,34,34,0.6), 0 0 80px rgba(255,34,34,0.2)",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
