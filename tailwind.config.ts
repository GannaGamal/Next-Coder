/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          navy: {
            900: 'var(--navy-900)',
            800: 'var(--navy-800)',
            700: 'var(--navy-700)',
          },
          purple: {
            500: '#8b5cf6',
            600: '#7c3aed',
          }
        }
      },
    },
    plugins: [],
  }
