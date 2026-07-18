import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#FF6B35",
          50: "#FFF3ED",
          100: "#FFE4D4",
          200: "#FFC5A8",
          300: "#FFA070",
          400: "#FF7F45",
          500: "#FF6B35",
          600: "#E65520",
          700: "#BF3E12",
          800: "#983312",
          900: "#7A2E13",
        },
        surface: {
          primary: "var(--color-surface-primary)",
          secondary: "var(--color-surface-secondary)",
          elevated: "var(--color-surface-elevated)",
        },
        content: {
          primary: "var(--color-content-primary)",
          secondary: "var(--color-content-secondary)",
          muted: "var(--color-content-muted)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          subtle: "var(--color-border-subtle)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "14px",
        md: "14px",
        lg: "20px",
        xl: "24px",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
};

export default config;
