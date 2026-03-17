import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: { 50: "#e6ecf2", 100: "#b3c4d9", 200: "#809cbd", 300: "#4d74a1", 400: "#264d85", 500: "#003366", 600: "#002d5c", 700: "#002347", 800: "#001a33", 900: "#00101f" },
        teal: { 50: "#e6f0f5", 100: "#b3d1e0", 200: "#80b3cc", 300: "#4d94b8", 400: "#267da8", 500: "#006699", 600: "#005c8a", 700: "#004d73", 800: "#003d5c", 900: "#002e45" },
        gold: { 50: "#faf5e6", 100: "#f0e0b3", 200: "#e6cc80", 300: "#dcb84d", 400: "#d4a926", 500: "#CC9900", 600: "#b88a00", 700: "#997300", 800: "#7a5c00", 900: "#5c4500" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
