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
        process: {
          DEFAULT: '#3b82f6', // blue-500
          hover: '#2563eb',   // blue-600
        },
        resource: {
          DEFAULT: '#10b981', // emerald-500
          hover: '#059669',   // emerald-600
        },
        deadlock: '#f43f5e',  // rose-500
        waiting: '#f59e0b',   // amber-500
        safe: '#22c55e',      // green-500
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
