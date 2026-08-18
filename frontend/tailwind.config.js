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
          primary: '#FAF8F5',
          secondary: '#F3EFE6',
          tertiary: '#EBE5D8',
          elevated: '#FFFFFF',
          card: '#FFFFFF',
        },
        surface: {
          card: '#FFFFFF',
          'card-hover': '#FDFCFA',
          sidebar: '#F2ECE2',
          navbar: 'rgba(250, 248, 245, 0.92)',
        },
        border: {
          primary: 'rgba(20, 20, 20, 0.08)',
          subtle: 'rgba(20, 20, 20, 0.05)',
          hover: 'rgba(217, 35, 56, 0.3)',
        },
        txt: {
          primary: '#141414',
          secondary: '#4A4641',
          muted: '#7A746C',
          disabled: '#A59F96',
        },
        brand: {
          crimson: '#D92338',
          crimsonHover: '#B8192C',
          coral: '#E63946',
          gold: '#C59B58',
          goldHover: '#B28846',
          sage: '#5F8575',
          emerald: '#2A7B4C',
          dark: '#141414',
        },
        accent: {
          DEFAULT: '#D92338',
          hover: '#B8192C',
          dark: '#141414',
          subtle: 'rgba(217, 35, 56, 0.08)',
          border: 'rgba(217, 35, 56, 0.22)',
        },
        status: {
          warning: '#D6A84F',
          'warning-subtle': 'rgba(214, 168, 79, 0.10)',
          danger: '#D92338',
          'danger-subtle': 'rgba(217, 35, 56, 0.10)',
          success: '#2A7B4C',
          'success-subtle': 'rgba(42, 123, 76, 0.10)',
          info: '#3B6E9C',
          'info-subtle': 'rgba(59, 110, 156, 0.10)',
        },
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
        'prem-sm': '0 2px 8px rgba(20, 20, 20, 0.04)',
        'prem-md': '0 8px 24px rgba(20, 20, 20, 0.06)',
        'prem-lg': '0 18px 42px -10px rgba(20, 20, 20, 0.09)',
        'prem-3d': '0 25px 50px -12px rgba(20, 20, 20, 0.12), 0 0 0 1px rgba(20, 20, 20, 0.06)',
        'prem-glow': '0 0 35px rgba(217, 35, 56, 0.18)',
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
