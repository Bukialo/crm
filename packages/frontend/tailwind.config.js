/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#f5f3ff',
            100: '#ede9fe',
            200: '#ddd6fe',
            300: '#c4b5fd',
            400: '#a78bfa',
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
            800: '#5b21b6',
            900: '#4c1d95',
            950: '#2e1065',
          },
          secondary: {
            50: '#fdf2f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f9a8d4',
            400: '#f472b6',
            500: '#ec4899',
            600: '#db2777',
            700: '#be185d',
            800: '#9d174d',
            900: '#831843',
            950: '#500724',
          },
          accent: '#00d4ff',
          success: '#00ff88',
          glass: {
            white: 'rgba(255, 255, 255, 0.1)',
            dark: 'rgba(0, 0, 0, 0.1)',
          }
        },
        backgroundImage: {
          'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          'gradient-secondary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          'gradient-accent': 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
          'gradient-success': 'linear-gradient(135deg, #00ff88 0%, #00cc66 100%)',
          'gradient-radial': 'radial-gradient(ellipse at top, var(--tw-gradient-stops))',
        },
        backdropBlur: {
          xs: '2px',
        },
        borderColor:{
          border: '#ccc',
        },
        animation: {
          'gradient-x': 'gradient-x 3s ease infinite',
          'gradient-y': 'gradient-y 3s ease infinite',
          'gradient-xy': 'gradient-xy 3s ease infinite',
          'float': 'float 6s ease-in-out infinite',
          'glow': 'glow 2s ease-in-out infinite',
        },
        keyframes: {
          'gradient-y': {
            '0%, 100%': {
              'background-size': '400% 400%',
              'background-position': 'center top'
            },
            '50%': {
              'background-size': '200% 200%',
              'background-position': 'center center'
            }
          },
          'gradient-x': {
            '0%, 100%': {
              'background-size': '200% 200%',
              'background-position': 'left center'
            },
            '50%': {
              'background-size': '200% 200%',
              'background-position': 'right center'
            }
          },
          'gradient-xy': {
            '0%, 100%': {
              'background-size': '400% 400%',
              'background-position': 'left center'
            },
            '50%': {
              'background-size': '200% 200%',
              'background-position': 'right center'
            }
          },
          'float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' },
          },
          'glow': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.5 },
          },
        },
        boxShadow: {
          'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.27)',
          'glass-lg': '0 16px 64px 0 rgba(31, 38, 135, 0.47)',
          'neon': '0 0 5px theme(colors.accent), 0 0 20px theme(colors.accent)',
        },
      },
    },
    plugins: [
      function({ addUtilities }) {
        const newUtilities = {
          '.glass': {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
          '.glass-dark': {
            background: 'rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          '.glass-morphism': {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          },
        }
        addUtilities(newUtilities)
      }
    ],
  }