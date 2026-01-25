/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#facc15', // Yellow
          dark: '#eab308',
          light: '#fef08a',
        },
        secondary: {
          DEFAULT: '#16a34a', // Green
          dark: '#15803d',
          light: '#86efac',
        },
      },
    },
  },
  plugins: [],
}