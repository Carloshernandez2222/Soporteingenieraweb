import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5B4B8A",
          dark: "#4A3D72",
          light: "#7B6BA8",
        },
        gray: {
          850: "#2D2D2D",
          950: "#1A1A1A",
        },
      },
      fontFamily: {
        /** Plus Jakarta Sans: moderna, cercana; encaja con marca joven sin perder legibilidad */
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 45s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
