/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        sans: ['"SF Pro Display"', '"PingFang SC"', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        breakfast: {
          DEFAULT: "hsl(var(--breakfast))",
          light: "hsl(var(--breakfast-light))",
          foreground: "hsl(var(--breakfast-foreground))",
        },
        lunch: {
          DEFAULT: "hsl(var(--lunch))",
          light: "hsl(var(--lunch-light))",
          foreground: "hsl(var(--lunch-foreground))",
        },
        dinner: {
          DEFAULT: "hsl(var(--dinner))",
          light: "hsl(var(--dinner-light))",
          foreground: "hsl(var(--dinner-foreground))",
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        pending: "hsl(var(--pending))",
        fasting: {
          start: '#1e3a8a',
          end: '#7c3aed',
        },
        eating: {
          start: '#f97316',
          end: '#fbbf24',
        },
      },
      borderRadius: {
        "2xl": "1.25rem",
        xl: "1rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "card": "0 2px 12px -2px hsl(var(--foreground) / 0.06)",
        "card-hover": "0 8px 24px -4px hsl(var(--foreground) / 0.1)",
        "meal": "0 4px 20px -4px hsl(var(--primary) / 0.15)",
        "glow-breakfast": "0 4px 20px -4px hsl(var(--breakfast) / 0.3)",
        "glow-lunch": "0 4px 20px -4px hsl(var(--lunch) / 0.3)",
        "glow-dinner": "0 4px 20px -4px hsl(var(--dinner) / 0.3)",
      },
      animation: {
        'breathing': 'breathing 2.5s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "slide-up": "slide-up 0.4s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
      },
      keyframes: {
        breathing: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
