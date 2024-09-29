/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".bg-transparent-important": {
          backgroundColor: "transparent !important",
        },
        ".bg-red-important": {
          backgroundColor: "#dc2626 !important",
        },
        ".border-red-important": {
          borderColor: "#dc2626 !important",
        },
        ".skeleton": {
          background:
            "linear-gradient(90deg, rgba(255, 255, 255, 0.2) 25%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.2) 75%)",
          animation: "skeleton-loading 50s linear infinite",
        },
        "@keyframes skeleton-loading": {
          "0%": {
            backgroundPosition: "-1000px 0",
          },
          "100%": {
            backgroundPosition: "1000px 0",
          },
        },
        ".gradient-dark": {
          background: "linear-gradient(to right, #000 50%, #fff 50%)",
        },
        ".gradient-light": {
          background: "linear-gradient(to right, #fff 50%, #000 50%)",
        },
      });
    },
  ],
};
