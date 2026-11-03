/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FCFBF8',
          100: '#F7F5F0',
          200: '#ECE7DD',
          300: '#DCD4C6',
          400: '#BFB4A2',
        },
        ink: {
          950: '#141210',
          900: '#1C1916',
          800: '#2A2621',
          700: '#403A33',
          600: '#575047',
          500: '#6F675C',
          400: '#8C8377',
        },
        brand: {
          50: '#FBF2EC',
          100: '#F5DFD2',
          200: '#EBC0A8',
          300: '#DE9B78',
          400: '#D06E45',
          500: '#C24F26',
          600: '#A83F1C',
          700: '#873217',
          800: '#6C2A16',
          900: '#572416',
        },
        moss: {
          600: '#3F6B4F',
          700: '#33573F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'Cambria', 'serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20,18,16,0.04), 0 8px 24px rgba(20,18,16,0.05)',
        lift: '0 2px 4px rgba(20,18,16,0.05), 0 16px 40px rgba(20,18,16,0.08)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
    },
  },
  plugins: [],
};
