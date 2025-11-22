/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3f7ff",
          100: "#dce7ff",
          200: "#b9ceff",
          300: "#93b3ff",
          400: "#6a9aff",
          500: "#4c83ff",
          600: "#2d69f5",
          700: "#1f52c2",
          800: "#183e8f",
          900: "#132c63",
        },
      },
      boxShadow: {
        glow: "0 0 32px rgba(76, 131, 255, 0.35)",
      },
      backgroundImage: {
        'radial-faint': "radial-gradient(1200px 600px at 10% 10%, rgba(76,131,255,0.18), transparent)",
        'radial-strong': "radial-gradient(900px 450px at 90% 30%, rgba(255,255,255,0.15), transparent)",
      },
    },
  },
  plugins: [],
};
