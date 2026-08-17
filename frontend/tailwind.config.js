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
        bg: {
          primary: '#0B0F14',
          secondary: '#10161D',
          tertiary: '#151C24',
          elevated: '#19212B',
        },
        surface: {
          card: '#141B23',
          'card-hover': '#1A232D',
          sidebar: '#0D1218',
          navbar: '#0D131A',
        },
        border: {
          primary: '#26313C',
          subtle: '#1D2731',
          hover: '#354351',
        },
        txt: {
          primary: '#F1F5F4',
          secondary: '#A7B1BA',
          muted: '#6F7B86',
          disabled: '#4B5661',
        },
        accent: {
          DEFAULT: '#2DD4A8',
          hover: '#1FAF8A',
          dark: '#167A67',
          subtle: 'rgba(45, 212, 168, 0.08)',
          border: 'rgba(45, 212, 168, 0.22)',
        },
        indigo: {
          accent: '#7185D8',
          hover: '#596DBF',
          subtle: 'rgba(113, 133, 216, 0.08)',
        },
        status: {
          warning: '#D6A84F',
          'warning-subtle': 'rgba(214, 168, 79, 0.08)',
          danger: '#D96C6C',
          'danger-subtle': 'rgba(217, 108, 108, 0.08)',
          success: '#62B58A',
          'success-subtle': 'rgba(98, 181, 138, 0.08)',
          info: '#6D9CCF',
          'info-subtle': 'rgba(109, 156, 207, 0.08)',
        },
        // Backward compatibility mappings
        brand: {
          500: '#2DD4A8',
          600: '#1FAF8A',
          700: '#167A67',
        },
        slate: {
          750: '#26313C',
          800: '#1D2731',
          850: '#151C24',
          900: '#10161D',
          950: '#0B0F14',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'slide-in': 'slideIn 0.25s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        }
      }
    },
  },
  plugins: [],
}
