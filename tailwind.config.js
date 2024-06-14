/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class', 
  theme: {
    extend: {
      colors: {
        'primary': '#b68bdcb1',
        'secondary': 'purple',
      }
    },
  },
  plugins: [require('flowbite/plugin')],
}