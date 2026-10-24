/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        // Warna Burgundy Resmi Sesuai Permintaan (#800020)
        burgundy: {
          DEFAULT: '#800020',
          50: '#fdf2f4',
          100: '#fbe5e9',
          200: '#f7cbda',
          300: '#efa2bd',
          400: '#e36d96',
          500: '#800020',
          600: '#6f001b',
          700: '#560015',
          800: '#3f0010',
          900: '#28000a',
          950: '#140005',
        },

        // Kombinasi Warna Serasi: Gold & Amber
        gold: {
          DEFAULT: '#d4af37',
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },

        // Warna Primer Burgundy (#800020)
        primary: {
          DEFAULT: '#800020',
          foreground: '#ffffff',
          50: '#fdf2f4',
          100: '#fbe5e9',
          200: '#f7cbda',
          300: '#efa2bd',
          400: '#e36d96',
          500: '#800020',
          600: '#6f001b',
          700: '#560015',
          800: '#3f0010',
          900: '#28000a',
        },

        accent: {
          DEFAULT: '#800020',
          foreground: '#ffffff',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px -3px rgba(128, 0, 32, 0.45)',
        'glow-burgundy': '0 0 25px -4px rgba(128, 0, 32, 0.55)',
        'glow-gold': '0 0 20px -3px rgba(212, 175, 55, 0.4)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
    },
  },
  plugins: [],
};
