/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0410",
        violet: "#7c3aed",
        magenta: "#e0459c",
        gold: "#f4c542",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "aurora": "radial-gradient(circle at 20% 20%, rgba(124,58,237,0.55), transparent 45%), radial-gradient(circle at 80% 0%, rgba(224,69,156,0.45), transparent 40%), radial-gradient(circle at 50% 100%, rgba(244,197,66,0.25), transparent 45%)",
      },
    },
  },
  plugins: [],
};
