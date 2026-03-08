import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./store/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#0D0D0F",
          soft: "#1A1A1F",
          muted: "#26262E",
        },
        accent: {
          DEFAULT: "#7C6AF7",
          bright: "#9B8DFF",
          dim: "#5B4FD4",
          glow: "#7C6AF740",
        },
        success: { DEFAULT: "#22C55E", dim: "#16A34A", bg: "#052E16" },
        warning: { DEFAULT: "#F59E0B", dim: "#D97706", bg: "#1C1207" },
        danger:  { DEFAULT: "#EF4444", dim: "#DC2626", bg: "#2D0707" },
        info:    { DEFAULT: "#38BDF8", dim: "#0EA5E9", bg: "#0C1F2D" },
      },
      backgroundImage: {
        "mesh-accent": "radial-gradient(ellipse at 20% 50%, #7C6AF720 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #9B8DFF15 0%, transparent 50%)",
        "mesh-dark": "radial-gradient(ellipse at 0% 0%, #1A1A2E 0%, #0D0D0F 60%)",
      },
      boxShadow: {
        "accent-glow": "0 0 30px #7C6AF730",
        "glow-violet": "0 0 20px rgba(124, 58, 237, 0.4)",
        "card": "0 1px 3px #00000040, 0 8px 24px #0000002A",
        "card-hover": "0 4px 12px #00000050, 0 16px 48px #0000003A",
        "modal": "0 24px 80px #00000080",
      },
      animation: {
        "slide-up": "fadeUp 0.3s ease-out",
        "fade-up": "fadeUp 0.4s ease forwards",
        "fade-in": "fadeIn 0.3s ease forwards",
        "slide-in-right": "slideInRight 0.35s cubic-bezier(0.16,1,0.3,1) forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "shimmer": "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeUp: { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideInRight: { "0%": { opacity: "0", transform: "translateX(20px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
    },
  },
  plugins: [],
};

export default config;