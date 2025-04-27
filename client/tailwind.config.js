/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        neonGreen: '#2d9e18',
        neonPink: '#FF00FF',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 8px #FF00FF, 0 0 16px #FF00FF',
      },
      dropShadow: {
        neon: '0 0 5px #2d9e18',
      },
    },
  },
  plugins: [],
};