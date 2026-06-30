/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          start: '#6366f1',   // indigo-500
          mid: '#8b5cf6',    // purple-500
          end: '#ec4899',    // pink-500
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.2)',
        },
        success: '#10b981',
        warning: '#f59e0b',
        favorite: '#f43f5e',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"PingFang SC"', 'sans-serif'],
        mono: ['"SF Pro Display"', '"Roboto"', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
        'gradient-bg': 'linear-gradient(135deg, #f8fafc 0%, rgba(99, 102, 241, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.5)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'ripple': 'ripple 0.6s linear',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(236, 72, 153, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};
