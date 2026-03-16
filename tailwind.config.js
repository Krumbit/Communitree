/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ivory: "#F1F7ED",
        "ivory-soft": "#FBFDF8",
        "ivory-deep": "#DDE8D8",
        slate: "#243E36",
        "slate-soft": "#35544B",
        "slate-muted": "#5B7169",
        teal: "#7CA982",
        "teal-soft": "#A6C4A9",
        "teal-mist": "#D8E7D6",
        "teal-deep": "#5F8770",
      },
    },
  },
  plugins: [],
};
