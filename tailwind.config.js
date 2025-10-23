/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        andiamo: '#602613', // Cor andiamo para Navbar e Sidebar
      },
      borderRadius: {
        '4xl': '2rem', // Opcional, se quiser manter rounded-4xl
      },
    },
  },
};