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
        landing: {
          bg: '#0B0F1D',
          card: '#141A2E',
          hover: '#1B2238',
          gold: '#E5A93C',
          teal: '#22B8A3',
          text: '#EDEEF3',
          muted: '#8D93AC',
          border: 'rgba(237,238,243,0.10)',
        },
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        dark: {
          bg: '#090d16',
          card: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
          hover: '#1e293b',
          muted: '#64748b',
          text: '#f8fafc',
        }
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.6875rem',
      }
    },
  },
  plugins: [],
}
