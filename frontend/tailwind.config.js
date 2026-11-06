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
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.75' },
        },
        glowTeal: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(13, 102, 93, 0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(6, 182, 212, 0.35)' },
        },
        pearlReveal: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up': 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 2.5s ease-in-out infinite',
        'glow-teal': 'glowTeal 3s ease-in-out infinite',
        'pearl-reveal': 'pearlReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.15s backwards',
      },
    },
  },
  plugins: [],
};
