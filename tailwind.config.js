/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        gold: {
          50: '#FDF8EF',
          100: '#F9EDDA',
          200: '#F0D5A8',
          300: '#E5BA73',
          400: '#D4A24E',
          500: '#C9A96E',
          600: '#B08D4A',
          700: '#8E6F38',
          800: '#6D5429',
          900: '#4A3819',
        },
        mint: {
          50: '#EFFAFA',
          100: '#D5F5F3',
          200: '#AFECE9',
          300: '#7EDFDB',
          400: '#4ECDC4',
          500: '#38B2A9',
          600: '#2D8F88',
          700: '#246F6A',
          800: '#1B5250',
          900: '#123736',
        },
        coral: {
          50: '#FFF0F0',
          100: '#FFE0E0',
          200: '#FFC2C2',
          300: '#FF9B9B',
          400: '#FF6B6B',
          500: '#E84D4D',
          600: '#C63636',
          700: '#9E2A2A',
          800: '#761E1E',
          900: '#4E1313',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"Source Han Sans SC"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
