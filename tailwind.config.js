/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'clay-bg': '#E8ECF4',
        'clay-purple': '#B8A9C9',
        'clay-pink': '#E8B4B8',
        'clay-yellow': '#F7DC6F',
        'clay-cyan': '#A3D9D0',
        'clay-blue': '#A9CCE3',
        'text-primary': '#4A5568',
        'text-secondary': '#718096',
        'text-tertiary': '#A0AEC0',
      },
      borderRadius: {
        'clay': '16px',
        'clay-lg': '20px',
        'clay-xl': '24px',
      },
    },
  },
  plugins: [],
}
