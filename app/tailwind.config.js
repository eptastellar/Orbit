/** @type {import('tailwindcss').Config} */
module.exports = {
   content: ["./src/**/*.{js,jsx,ts,tsx}"],
   theme: {
      extend: {
         colors: {
            "white": "#FBFBFB",
            "black": "#030303",
            "primary": "#4A2782",
            "secondary": "#22133A",
            "accent": "#7138CC",
         },
      },
   },
   plugins: [],
}
