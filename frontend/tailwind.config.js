/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#fff7f8",
        ink: "#111827",
        primary: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
        secondary: "#fb7185",
        accent: "#111827",
        mist: "#fff1f2",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(127, 29, 29, 0.11)",
        glow: "0 18px 40px rgba(220, 38, 38, 0.28)",
        panel: "0 25px 55px rgba(15, 23, 42, 0.12)",
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
