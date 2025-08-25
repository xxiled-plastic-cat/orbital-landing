/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'sora': ['Sora', 'sans-serif'],
        'mono': ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
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
        // Industrial textures
        'noise-light': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
        'noise-dark': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.02\'/%3E%3C/svg%3E")',
      },
      boxShadow: {
        'neon': '0 0 10px rgba(102, 252, 241, 0.5), 0 0 20px rgba(102, 252, 241, 0.3)',
        'neon-hover': '0 0 15px rgba(102, 252, 241, 0.7), 0 0 30px rgba(102, 252, 241, 0.5)',
        'neon-purple': '0 0 10px rgba(138, 43, 226, 0.5), 0 0 20px rgba(138, 43, 226, 0.3)',
        // Industrial depth shadows
        'industrial': '0 8px 24px rgba(0, 0, 0, 0.25)',
        'industrial-hover': '0 12px 32px rgba(0, 0, 0, 0.3)',
        'inset': 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
        'button-inset': 'inset 0 1px 2px rgba(0, 0, 0, 0.4)',
        // Edge lighting
        'edge-glow': '0 -2px 0 rgba(102, 252, 241, 0.3)',
        'top-highlight': '0 1px 0 rgba(255, 255, 255, 0.1)',
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
      
      // Industrial design utilities
      const industrialUtilities = {
        '.tabular-nums': {
          'font-variant-numeric': 'tabular-nums'
        },
        '.industrial-card': {
          'background': 'rgb(30 41 59)',
          'background-image': 'var(--tw-gradient-to-r), var(--noise-texture)',
          'border': '2px solid rgb(51 65 85)',
          'box-shadow': '0 8px 24px rgba(0, 0, 0, 0.25), 0 1px 0 rgba(255, 255, 255, 0.1)',
          'position': 'relative',
          '&:hover': {
            'transform': 'translateY(-2px)',
            'box-shadow': '0 12px 32px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.1)'
          },
          'transition': 'all 150ms ease-out'
        },
        '.industrial-button': {
          'height': '48px',
          'font-weight': '600',
          'box-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.2)',
          'transition': 'all 150ms ease-out',
          '&:hover': {
            'transform': 'translateY(-1px)',
            'box-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 6px 16px rgba(0, 0, 0, 0.25)'
          },
          '&:active': {
            'transform': 'translateY(1px)',
            'box-shadow': 'inset 0 2px 4px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)'
          },
          '&:disabled': {
            'transform': 'none',
            'box-shadow': 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
            'opacity': '0.6',
            'cursor': 'not-allowed'
          }
        },
        '.inset-panel': {
          'box-shadow': 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 -1px 0 rgba(255, 255, 255, 0.05)',
          'background': 'rgb(24 33 47)',
          'border': '1px solid rgb(15 23 42)'
        },
        '.orbital-ring': {
          'height': '14px',
          'border-radius': '7px',
          'box-shadow': 'inset 0 1px 0 rgba(0, 0, 0, 0.4)',
          'background': 'rgb(71 85 105)',
          'position': 'relative',
          'overflow': 'hidden'
        },
        '.planet-ring': {
          'box-shadow': '0 4px 8px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(102, 252, 241, 0.2)',
          'border-radius': '50%'
        }
      }
      addUtilities(industrialUtilities)
    }
  ],
};