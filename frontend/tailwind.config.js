/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      colors: {
        primario: '#E80B2C',
        secundario: '#C95D63',
        terciario: '#AE8799',
        cuaternario: '#717EC3',
        quinquenario: '#496DDB',
      },
    },
  },
  plugins: [],
  important: true
}

