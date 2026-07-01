/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f0f9ff",
        ink: "#0c4a6e",
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: "#38bdf8",
        accent: "#0ea5e9",
        mist: "#e0f2fe",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(14, 165, 233, 0.11)",
        glow: "0 18px 40px rgba(2, 132, 199, 0.28)",
        panel: "0 25px 55px rgba(12, 74, 110, 0.12)",
      },
      fontFamily: {
        heading: ["Outfit", "sans-serif"],
        body: ["Plus Jakarta Sans", "sans-serif"],
      },
      keyframes: {
        reveal: {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: 0.55 },
          "50%": { opacity: 1 },
        },
        drift: {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "50%": { transform: "translateY(-10px) translateX(6px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(150%) skewX(-25deg)" }
        }
      },
      animation: {
        reveal: "reveal 0.5s ease-out forwards",
        pulseSoft: "pulseSoft 2.4s ease-in-out infinite",
        drift: "drift 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
