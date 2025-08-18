/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'sora': ['Sora', 'sans-serif'],
      },
      colors: {
        'space-dark': '#0b0c10',
        'space-gray': '#1f2833',
        'neon-blue': '#45a29e',
        'neon-teal': '#66fcf1',
        'neon-purple': '#8a2be2',
        'neon-pink': '#f72585',
        'deep-blue': '#1b1e3a',
        'soft-gray': '#c5c6c7'
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'orbit': 'orbit 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { filter: 'brightness(1) drop-shadow(0 0 5px rgba(102, 252, 241, 0.7))' },
          '50%': { filter: 'brightness(1.3) drop-shadow(0 0 15px rgba(102, 252, 241, 0.9))' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' },
        }
      },
      backgroundImage: {
        'space-gradient': 'linear-gradient(180deg, #0b0c10 0%, #1b1e3a 100%)',
        'orbital-grid': 'radial-gradient(circle, rgba(102, 252, 241, 0.1) 1px, transparent 1px)',
      },
      boxShadow: {
        'neon': '0 0 10px rgba(102, 252, 241, 0.5), 0 0 20px rgba(102, 252, 241, 0.3)',
        'neon-hover': '0 0 15px rgba(102, 252, 241, 0.7), 0 0 30px rgba(102, 252, 241, 0.5)',
        'neon-purple': '0 0 10px rgba(138, 43, 226, 0.5), 0 0 20px rgba(138, 43, 226, 0.3)',
      },
    },
  },
  plugins: [
    function({ addUtilities, theme }) {
      const cutCorners = {
        '.cut-corners-sm': {
          '--corner-size': '8px',
          'position': 'relative',
          'background': 'currentColor',
          'clip-path': 'polygon(var(--corner-size) 0%, 100% 0%, 100% calc(100% - var(--corner-size)), calc(100% - var(--corner-size)) 100%, 0% 100%, 0% var(--corner-size))',
          '&::before': {
            'content': '""',
            'position': 'absolute',
            'inset': '1px',
            'background': 'rgb(30 41 59)',
            'clip-path': 'polygon(calc(var(--corner-size) - 1px) 0%, 100% 0%, 100% calc(100% - var(--corner-size) + 1px), calc(100% - var(--corner-size) + 1px) 100%, 0% 100%, 0% calc(var(--corner-size) - 1px))',
            'z-index': '1'
          },
          '& > *': {
            'position': 'relative',
            'z-index': '2'
          }
        },
        '.cut-corners-md': {
          '--corner-size': '12px',
          'position': 'relative',
          'background': 'currentColor',
          'clip-path': 'polygon(var(--corner-size) 0%, 100% 0%, 100% calc(100% - var(--corner-size)), calc(100% - var(--corner-size)) 100%, 0% 100%, 0% var(--corner-size))',
          '&::before': {
            'content': '""',
            'position': 'absolute',
            'inset': '1px',
            'background': 'rgb(30 41 59)',
            'clip-path': 'polygon(calc(var(--corner-size) - 1px) 0%, 100% 0%, 100% calc(100% - var(--corner-size) + 1px), calc(100% - var(--corner-size) + 1px) 100%, 0% 100%, 0% calc(var(--corner-size) - 1px))',
            'z-index': '1'
          },
          '& > *': {
            'position': 'relative',
            'z-index': '2'
          }
        },
        '.cut-corners-lg': {
          '--corner-size': '16px',
          'position': 'relative',
          'background': 'currentColor',
          'clip-path': 'polygon(var(--corner-size) 0%, 100% 0%, 100% calc(100% - var(--corner-size)), calc(100% - var(--corner-size)) 100%, 0% 100%, 0% var(--corner-size))',
          '&::before': {
            'content': '""',
            'position': 'absolute',
            'inset': '1px',
            'background': 'rgb(30 41 59)',
            'clip-path': 'polygon(calc(var(--corner-size) - 1px) 0%, 100% 0%, 100% calc(100% - var(--corner-size) + 1px), calc(100% - var(--corner-size) + 1px) 100%, 0% 100%, 0% calc(var(--corner-size) - 1px))',
            'z-index': '1'
          },
          '& > *': {
            'position': 'relative',
            'z-index': '2'
          }
        }
      }
      addUtilities(cutCorners)
    }
  ],
};