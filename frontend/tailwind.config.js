/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        'primary-hover': '#1D4ED8',
        secondary: '#0EA5A4',
        background: '#F8FAFC',
        card: '#FFFFFF',
        'text-main': '#0F172A',
        'text-muted': '#6B7280',
        accent: '#7C3AED',
        success: '#16A34A',
        warning: '#F59E0B',
        error: '#EF4444',
        overlay: 'rgba(15,23,42,0.06)',
      },
      boxShadow: {
        soft: '0 18px 45px rgba(15,23,42,0.06)',
      },
      borderRadius: {
        '2xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'ui-sans-serif', 'sans-serif'],
      },
    },
  },
  plugins: [],
};


