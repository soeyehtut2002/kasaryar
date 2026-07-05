/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#07090e',
          900: '#0c0f16',
          800: '#161b26',
          700: '#202938',
          600: '#2d394d',
        },
        primary: {
          400: '#ff7733',
          500: '#ff5500',
          600: '#dd4400',
          700: '#aa3300',
        },
        accent: {
          400: '#33f0ff',
          500: '#00e5ff',
          600: '#00bccc',
        }
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))',
      }
    },
  },
  plugins: [],
}
