/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Night pitch under floodlights
        turf: {
          bg: '#0C1F17',
          surface: '#11281E',
          raised: '#183428',
          line: '#264638',
        },
        // Chalk pitch markings
        chalk: {
          DEFAULT: '#EEF3EF',
          muted: '#A3B8AC',
          faint: '#6E8A7C',
        },
        // Trophy gold — the single accent
        gold: {
          DEFAULT: '#F2C14E',
          deep: '#C99A2E',
        },
        silver: '#C9D3CD',
        bronze: '#D49A6A',
        win: '#5AD38E',
        draw: '#9FB1A7',
        loss: '#F06A5F',
        lower: '#7FB0E0',
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', 'Impact', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
