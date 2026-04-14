/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef6ff',
          100: '#d9eaff',
          200: '#bbdaff',
          300: '#8cc3ff',
          400: '#56a1ff',
          500: '#2f7bff',
          600: '#1a5cf5',
          700: '#1347e1',
          800: '#163ab6',
          900: '#18358f',
          950: '#142257',
        },
        accent: {
          50:  '#fffbeb',
          100: '#fff3c6',
          200: '#ffe588',
          300: '#ffd24a',
          400: '#ffbf20',
          500: '#f99d07',
          600: '#dd7502',
          700: '#b75206',
          800: '#943f0c',
          900: '#7a340d',
          950: '#461a02',
        },
        electric: {
          50:  '#f0fdff',
          100: '#ccfbfe',
          200: '#99f6fc',
          300: '#53ecf9',
          400: '#1dd8ee',
          500: '#00bcd4',
          600: '#0396b2',
          700: '#0a7890',
          800: '#126075',
          900: '#144f63',
          950: '#063444',
        },
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(47, 123, 255, 0.5), 0 0 20px rgba(47, 123, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(47, 123, 255, 0.8), 0 0 60px rgba(47, 123, 255, 0.4)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #142257 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(47,123,255,0.1), rgba(0,188,212,0.05))',
        'accent-gradient': 'linear-gradient(135deg, #2f7bff 0%, #00bcd4 100%)',
        'gold-gradient': 'linear-gradient(135deg, #f99d07 0%, #ffd24a 100%)',
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(47, 123, 255, 0.3)',
        'glow-md': '0 0 30px rgba(47, 123, 255, 0.4)',
        'glow-lg': '0 0 60px rgba(47, 123, 255, 0.3)',
        'card': '0 4px 30px rgba(0, 0, 0, 0.12)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}
