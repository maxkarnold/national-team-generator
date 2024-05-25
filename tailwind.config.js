/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        // primary: "#4F4F4F",
        // primary_dark: "#474747",
        // primary_darker: "#403f3f",
        // primary_light: "#d3d1d1e6",
        // secondary: "#35407c",
        // secondary_light: "#6a75d8",
        // theme_black: "#2f2f2f",
        // star_color: "#ffffff",
        // star_background: "#fc0"
      },
      transitionDuration: {
        '0': '0ms',
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["garden", "dark", "nord", "emerald", "pastel", "cmyk", "bumblebee", "dim"]
  }
}
