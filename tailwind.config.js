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
        obsidian: {
          DEFAULT: '#0A090D',
          dark: '#07060A',
          card: '#0D0D12',
          surface: '#14121B',
          border: '#231F2E',
          muted: '#1A1822',
        },
        maroon: {
          DEFAULT: '#800020',
          50: '#FDF2F4',
          100: '#FBE8EC',
          200: '#F5C6D0',
          300: '#EE94A8',
          400: '#E15576',
          500: '#C7244D',
          600: '#A30D35',
          700: '#800020',
          800: '#66001A',
          900: '#500014',
          950: '#33000D',
        },
        electric: {
          DEFAULT: '#2563EB',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'brand-gradient': 'linear-gradient(to right, #800020, #581C87, #2563EB)',
        'brand-radial': 'radial-gradient(circle at top, rgba(128, 0, 32, 0.25) 0%, rgba(37, 99, 235, 0.15) 50%, rgba(10, 9, 13, 0) 100%)',
      },
      boxShadow: {
        'glow-maroon': '0 0 25px -5px rgba(128, 0, 32, 0.45), 0 0 10px -3px rgba(128, 0, 32, 0.3)',
        'glow-blue': '0 0 25px -5px rgba(37, 99, 235, 0.45), 0 0 10px -3px rgba(37, 99, 235, 0.3)',
        'glow-hybrid': '-10px 0 25px -5px rgba(128, 0, 32, 0.35), 10px 0 25px -5px rgba(37, 99, 235, 0.35)',
      },
    },
  },
  plugins: [],
};
