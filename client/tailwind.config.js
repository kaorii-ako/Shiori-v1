/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surface tokens
        surface: '#10141a',
        surface_bright: '#181c22',
        surface_container_lowest: '#0a0e14',
        surface_container_low: '#14181e',
        surface_container: '#181c22',
        surface_container_high: '#21262d',
        surface_container_highest: '#31353c',
        surface_variant: '#31353c',
        outline: '#8c90a0',
        outline_variant: '#424754',
        on_surface: '#dfe2eb',
        on_surface_variant: '#8c90a0',
        on_background: '#e3e6ed',
        on_surface_inverse: '#10141a',

        // Accent tokens
        primary: '#afc6ff',
        primary_container: '#528dff',
        primary_dim: '#7da5f9',
        secondary: '#d7ffc5',
        secondary_container: '#4a6c3a',
        tertiary: '#e5b5ff',
        tertiary_container: '#8b63a5',
        tertiary_variant: '#c58aff',
        inverse_surface: '#21262d',
        inverse_primary: '#3964c5',

        // Semantic
        error: '#ffb4ab',
        success: '#4ad778',
      },

      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },

      borderRadius: {
        'none': '0',
        'xs': '4px',
        'sm': '8px',
        'DEFAULT': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },

      boxShadow: {
        'ambient': '0 32px 64px rgba(223,226,235,0.04)',
        'ambient-lg': '0 48px 96px rgba(223,226,235,0.06)',
        'ambient-sm': '0 8px 32px rgba(223,226,235,0.03)',
        'primary': '0 8px 32px rgba(82,141,255,0.15)',
        'secondary': '0 8px 32px rgba(215,255,197,0.08)',
        'tertiary': '0 8px 32px rgba(229,181,255,0.1)',
        'inner': 'inset 0 1px 0 rgba(223,226,235,0.04)',
        'ghost': '0 2px 8px rgba(0,0,0,0.12)',
      },

      backdropBlur: {
        'glass': '20px',
      },

      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },

      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.25s ease-out',
        'slide-down': 'slide-down 0.25s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
