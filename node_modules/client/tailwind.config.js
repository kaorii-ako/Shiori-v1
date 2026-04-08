/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a14',
        'bg-secondary': '#12121f',
        'bg-card': '#1a1a2e',
        'accent-pink': '#ff6b9d',
        'accent-purple': '#c44dff',
        'accent-blue': '#4d9fff',
        'accent-cyan': '#00f5ff',
        'accent-yellow': '#ffe94e',
        'accent-success': '#4dff91',
        'accent-warning': '#ffaa4d',
        'accent-danger': '#ff4d6a',
        'text-primary': '#f0f0f5',
        'text-secondary': '#a0a0b5',
        'text-muted': '#606080',
      },
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'monospace'],
        'pixel-alt': ['VT323', 'monospace'],
        'body': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'none': '0',
      },
      boxShadow: {
        'pixel': 'inset -2px -2px 0 0 #1a1a2e, inset 2px 2px 0 0 #2a2a4e, 0 4px 0 #1a1a2e',
        'pixel-glow': 'inset -2px -2px 0 0 #1a1a2e, inset 2px 2px 0 0 #2a2a4e, 0 4px 0 #1a1a2e, 0 0 20px rgba(255, 107, 157, 0.3)',
      },
      animation: {
        'bounce-pixel': 'pixel-bounce 0.3s ease infinite',
        'twinkle': 'twinkle 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pixel-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'twinkle': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
