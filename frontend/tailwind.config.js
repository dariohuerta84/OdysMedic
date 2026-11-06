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
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          border: '#E2E8F0',
          borderSubtle: '#F1F5F9',
          textPrimary: '#0F172A',
          textSecondary: '#334155',
          textMuted: '#64748B',
          teal: {
            DEFAULT: '#0284C7',
            hover: '#0369A1',
            light: '#38BDF8',
          },
          mint: '#10B981',
          cyan: '#0284C7',
          amber: '#F59E0B',
          coral: '#F43F5E',
          violet: '#6366F1',
        },
        celeste: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
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
        glowCeleste: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(186, 230, 253, 0.4)' },
          '50%': { boxShadow: '0 0 25px rgba(125, 211, 252, 0.6)' },
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
        'glow-celeste': 'glowCeleste 3s ease-in-out infinite',
        'pearl-reveal': 'pearlReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.15s backwards',
      },
    },
  },
  plugins: [],
};
