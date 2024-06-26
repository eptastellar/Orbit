import { Config } from "tailwindcss"

const config: Config = {
   content: [
      "./src/app/**/*.{ts,tsx}",
      "./src/assets/icons/*.{ts,tsx}",
      "./src/components/**/*.{ts,tsx}",
   ],
   theme: {
      extend: {
         colors: {
            "abs-black": "#000000",
            "abs-white": "#FFFFFF",
            "black": "#111111",
            "blue-3": "#7DB0DE",
            "blue-5": "#1D5C96",
            "blue-7": "#12395D",
            "gray-3": "#717171",
            "gray-5": "#585858",
            "gray-7": "#262626",
            "red-5": "#E11D48",
            "white": "#FBFBFB",
         },
         height: {
            "108": "27rem"
         },
         screens: {
            "device": "512px"
         }
      },
   },
   plugins: [],
}

export default config
