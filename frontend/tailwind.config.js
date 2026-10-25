/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory:     { DEFAULT: '#F6F4EC', dark: '#EDE9D8' },
        sage:      { DEFAULT: '#D9E8D4', dark: '#B8D4B0' },
        teal:      { DEFAULT: '#286B5B', light: '#3A8A74', dark: '#1A4A3E' },
        terracotta:{ DEFAULT: '#D98F70', light: '#E8A98E', dark: '#B8704F' },
        chartreuse:{ DEFAULT: '#DCEB88', dark: '#C8D96A' },
        graphite:  { DEFAULT: '#26312D', light: '#3D4F49', muted: '#6B7E78' },
      },
      fontFamily: {
        sans: ['Manrope', 'DM Sans', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'DM Sans', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 4px 24px rgba(38,49,45,0.08), 0 1px 4px rgba(38,49,45,0.06)',
        card: '0 2px 12px rgba(38,49,45,0.07)',
        teal: '0 4px 16px rgba(40,107,91,0.18)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
      },
    },
  },
  plugins: [],
}
