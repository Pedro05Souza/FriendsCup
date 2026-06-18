/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gh: {
          bg: '#0d1117',
          surface: '#161b22',
          elevated: '#21262d',
          border: '#30363d',
          muted: '#8b949e',
        },
      },
    },
  },
  plugins: [],
}
