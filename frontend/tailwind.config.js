/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  safelist: [
    // dynamic class lewat template literal di Login.jsx
    'bg-warga-50', 'bg-warga-100', 'bg-warga-600',
    'bg-admin-50', 'bg-admin-100', 'bg-admin-600', 'bg-admin-700',
    'text-warga-600', 'text-admin-600',
    'from-warga-50', 'from-admin-50',
    'to-warga-50', 'to-admin-50',
  ],
  theme: {
    extend: {
      colors: {
        // Warna brand sesuai swimlane di Activity Diagram
        warga: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        admin: {
          50:  '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
