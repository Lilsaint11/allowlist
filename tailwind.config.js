/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B1120',
        surface: '#121A2B',
        raised: '#182238',
        line: '#26314A',
        gold: '#C9A227',
        goldSoft: '#E4C766',
        parchment: '#EDE7D3',
        muted: '#8892A4',
        emerald: '#4C7A5E',
        amber: '#C98A3B',
        rose: '#B4524A',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        grain: "radial-gradient(circle at 1px 1px, rgba(237,231,211,0.035) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
}
