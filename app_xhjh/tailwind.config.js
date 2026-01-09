

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#f59e0b',
        tertiary: '#10b981',
        success: '#22c55e',
        danger: '#ef4444',
        info: '#3b82f6',
        'text-primary': '#1f2937',
        'text-secondary': '#6b7280',
        'bg-gradient-start': '#667eea',
        'bg-gradient-end': '#764ba2',
        'card-gradient-start': '#ffecd2',
        'card-gradient-end': '#fcb69f',
        'sidebar-gradient-start': '#a8edea',
        'sidebar-gradient-end': '#fed6e3'
      },
      backgroundImage: {
        'main-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'card-gradient': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        'sidebar-gradient': 'linear-gradient(180deg, #a8edea 0%, #fed6e3 100%)',
        'stats-gradient-1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'stats-gradient-2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'stats-gradient-3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'stats-gradient-4': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'button-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'hover-gradient': 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'gradient': '0 10px 25px rgba(102, 126, 234, 0.3)'
      }
    }
  },
  plugins: [],
}

