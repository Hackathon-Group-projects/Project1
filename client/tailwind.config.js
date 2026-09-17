/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#080C14",
        surface: "#0E1524",
        surfaceLight: "#141D30",
        surfaceBorder: "#172338",
        surfaceBorderHover: "#233554",
        cyberTeal: {
          light: "#2DD4BF",
          DEFAULT: "#14B8A6",
          dark: "#0F766E",
        },
        severity: {
          critical: "#EF4444",
          high: "#F97316",
          medium: "#F59E0B",
          low: "#3B82F6",
          info: "#64748B",
          safe: "#10B981",
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(20, 184, 166, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(20, 184, 166, 0.5)' },
        }
      }
    },
  },
  plugins: [],
}
