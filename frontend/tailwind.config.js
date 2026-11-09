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
        classic: {
          ivory: '#FDFCFA',
          paper: '#F7F6F2',
          sage: '#F2F7F6',
          sageSoft: '#EAF4F2',
          sageMuted: '#D9EAE6',
          teal: '#0E6F65',
          tealDark: '#0A564E',
          sidebar: '#0A3D38',
          ink: '#0B252E',
          navy: '#0D2B3E',
          slate: '#4A606A',
          muted: '#6E828A',
          sand: '#FDF7E7',
          sandBorder: '#EFE2BE',
          gold: '#C9A96E',
          blush: '#FBF1F1',
          blushBorder: '#F0D6D6',
          roseInk: '#9E3F42',
          stone: '#EAECEB',
          border: '#E3E8E6',
        },
        clinical: {
          bg: '#FDFCFA',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          border: '#E3E8E6',
          borderSubtle: '#F2F7F6',
          textPrimary: '#0B252E',
          textSecondary: '#354B54',
          textMuted: '#6E828A',
          teal: {
            DEFAULT: '#0E6F65',
            hover: '#0A564E',
            light: '#EAF4F2',
          },
          mint: '#1E7A5F',
          cyan: '#0E6F65',
          amber: '#B9852D',
          coral: '#B44B4E',
          violet: '#4A5D7A',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        pearlReveal: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up': 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pearl-reveal': 'pearlReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards',
      },
    },
  },
  plugins: [],
};
