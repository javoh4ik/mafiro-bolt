/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        noir: {
          obsidian: "#07090E",
          surface: "#0D1119",
          card: "#121824",
          border: "rgba(255, 255, 255, 0.08)",
          gold: "#D4AF37",
          "gold-light": "#F2DC87",
          "gold-dark": "#997A1E",
          "gold-glow": "rgba(212, 175, 55, 0.25)",
          crimson: "#8B1E2E",
          "crimson-glow": "rgba(139, 30, 46, 0.35)",
          emerald: "#0E3827",
          "emerald-glow": "rgba(14, 56, 39, 0.35)",
        },
        felt: {
          night: "#0E1726",
          day: "#092218",
          vote: "#260B12",
        }
      },
      fontFamily: {
        serif: ['"Cinzel"', '"Cormorant Garamond"', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'luxury': '0 8px 32px 0 rgba(0, 0, 0, 0.65), 0 0 1px 1px rgba(212, 175, 55, 0.25)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.35)',
        'crimson-glow': '0 0 25px rgba(220, 38, 38, 0.3)',
        'inner-felt': 'inset 0 0 45px rgba(0, 0, 0, 0.85)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      }
    },
  },
  plugins: [],
}
