/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
      },
      spacing: {
        'sm': '0.5rem',
        'base': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
      },
    },
  },
  plugins: [],
}
