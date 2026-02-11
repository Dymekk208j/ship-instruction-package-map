/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          start: '#667eea',
          end: '#764ba2',
        },
        accent: {
          start: '#f093fb',
          end: '#f5576c',
        },
      },
    },
  },
  plugins: [],
};
