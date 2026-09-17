/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--forest-primary)",
          foreground: "var(--white)",
        },
        forest: {
          primary: "var(--forest-primary)",
          deep: "var(--forest-deep)",
          dark: "var(--forest-dark)",
          secondary: "var(--forest-secondary)",
        },
        sage: {
          DEFAULT: "var(--sage)",
          light: "var(--sage-light)",
        },
        palegreen: "var(--green-pale)",
        sand: "var(--sand)",
        cream: "var(--cream)",
        white: "var(--white)",
        charcoal: "var(--text-primary)",
        secondaryText: "var(--text-secondary)",
        mutedText: "var(--text-muted)",
        brandBorder: "var(--border)",
        risk: {
          low: '#5E8064',
          medium: '#B29145',
          high: '#A46148',
          critical: '#7A3838',
        },
        saffron: {
          DEFAULT: '#FF9933',
          dark: '#E68A2E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
