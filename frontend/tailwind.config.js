/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        surface: '#09090b',
        card: 'rgba(255, 255, 255, 0.03)',
        textPrimary: '#FFFFFF',
        textSecondary: '#A1A1AA',
        gold: '#D4AF37',
        copper: '#B87333',
        goldGlow: 'rgba(212, 175, 55, 0.15)',
        border: 'rgba(255, 255, 255, 0.1)',
        success: '#2A9D8F',
        warning: '#E9C46A',
        error: '#E76F51',
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        outfit: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        '2xl': '24px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}