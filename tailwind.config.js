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
          obsidian: "#05070B",
          surface: "#0A0E17",
          card: "#0F1522",
          border: "rgba(255, 255, 255, 0.08)",
          crimson: "#FF2A55",
          "crimson-light": "#FF8FA5",
          "crimson-dark": "#A3122F",
          "crimson-glow": "rgba(255, 42, 85, 0.35)",
          blood: "#8B1E2E",
          emerald: "#0E3827",
        },
        felt: {
          night: "#101A2E",
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
        'luxury': '0 8px 32px 0 rgba(0, 0, 0, 0.65), 0 0 1px 1px rgba(255, 42, 85, 0.25)',
        'gold-glow': '0 0 20px rgba(255, 42, 85, 0.35)',
        'crimson-glow': '0 0 25px rgba(255, 42, 85, 0.35)',
        'inner-felt': 'inset 0 0 45px rgba(0, 0, 0, 0.85)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.25s ease-out',
        'message-in': 'messageIn 0.22s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        messageIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
