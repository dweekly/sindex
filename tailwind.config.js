/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './template/**/*.{html,js,hbs}',
    './public/**/*.html'
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        }
      },
      fontFamily: {
        'bebas': ['Bebas Neue', 'Arial Narrow', 'Helvetica Condensed', 'Arial', 'sans-serif'],
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}