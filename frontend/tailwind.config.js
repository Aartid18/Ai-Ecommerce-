/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#F4F0E8',
          secondary: '#E9E3D8',
          tertiary: '#DFD7C9',
          elevated: '#FFFFFF',
          card: '#FFFFFF',
        },
        surface: {
          card: '#FFFFFF',
          'card-hover': '#FAF8F4',
          sidebar: '#EDE7DC',
          navbar: 'rgba(244, 240, 232, 0.92)',
        },
        border: {
          primary: 'rgba(23, 23, 23, 0.10)',
          subtle: 'rgba(23, 23, 23, 0.06)',
          hover: 'rgba(168, 20, 32, 0.35)',
        },
        txt: {
          primary: '#171717',
          secondary: '#55504A',
          muted: '#7E776F',
          disabled: '#A8A29A',
        },
        brand: {
          crimson: '#A81420',
          crimsonHover: '#8B0F19',
          red: '#C92832',
          gold: '#C59A52',
          sage: '#7F9685',
          paleRed: '#F3D7D8',
          dark: '#171717',
        },
        accent: {
          DEFAULT: '#A81420',
          hover: '#8B0F19',
          dark: '#171717',
          subtle: 'rgba(168, 20, 32, 0.08)',
          border: 'rgba(168, 20, 32, 0.22)',
        },
        indigo: {
          accent: '#7185D8',
          hover: '#596DBF',
          subtle: 'rgba(113, 133, 216, 0.08)',
        },
        status: {
          warning: '#D6A84F',
          'warning-subtle': 'rgba(214, 168, 79, 0.10)',
          danger: '#A81420',
          'danger-subtle': 'rgba(168, 20, 32, 0.10)',
          success: '#3A835C',
          'success-subtle': 'rgba(58, 131, 92, 0.10)',
          info: '#4B729F',
          'info-subtle': 'rgba(75, 114, 159, 0.10)',
        },
        // Backward compatibility mappings
        slate: {
          750: '#DFD7C9',
          800: '#E9E3D8',
          850: '#F0EAE0',
          900: '#F4F0E8',
          950: '#FAF8F5',
        }
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'prem-sm': '0 2px 8px rgba(23, 23, 23, 0.04)',
        'prem-md': '0 8px 24px rgba(23, 23, 23, 0.06)',
        'prem-lg': '0 18px 42px -10px rgba(23, 23, 23, 0.09)',
        'prem-3d': '0 25px 50px -12px rgba(23, 23, 23, 0.12), 0 0 0 1px rgba(23, 23, 23, 0.06)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'float-slow': 'floatSlow 10s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(1deg)' },
        }
      }
    },
  },
  plugins: [],
}
