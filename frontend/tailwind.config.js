/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F5F0",
        surface: "#FFFFFF",
        ink: "#1C1B17",
        muted: "#716C63",
        faint: "#A29C90",
        line: "#E3DED4",
        accent: { DEFAULT: "#1D5C41" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};