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
        clinical: {
          bg: '#090A0F',
          surface: '#0E1117',
          card: 'rgba(255, 255, 255, 0.03)',
          border: 'rgba(255, 255, 255, 0.08)',
          teal: {
            DEFAULT: '#0D665D',
            hover: '#0A524A',
            light: '#148F82',
          },
          mint: '#10B981',
          cyan: '#06B6D4',
          amber: '#F59E0B',
          coral: '#F43F5E',
          violet: '#6366F1',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
