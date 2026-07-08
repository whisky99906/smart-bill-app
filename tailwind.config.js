/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'clay-bg': '#F0F7FF',
        'clay-primary': '#6BB3D9',
        'clay-primary-light': '#94C8E8',
        'clay-primary-dark': '#4A9AC4',
        'clay-secondary': '#A8D8EA',
        'clay-accent': '#7EC8E3',
        'clay-muted': '#C5DDEF',
        'text-primary': '#2C4A6B',
        'text-secondary': '#5A7A9A',
        'text-tertiary': '#8BA4BE',
      },
      borderRadius: {
        'clay': '20px',
        'clay-lg': '24px',
        'clay-xl': '28px',
        'clay-2xl': '32px',
      },
    },
  },
  plugins: [],
}
