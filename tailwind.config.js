/** @type {import('tailwindcss').Config} */
// const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './renderer/src/components/**/*.{js,ts,jsx,tsx}',
    './renderer/src/layouts/**/*.{js,ts,jsx,tsx}',
    './renderer/src/core/**/*.{js,ts,jsx,tsx}',
    './renderer/src/modules/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        primary: '#FF5500',
        'primary-50': '#E4F2FF',
        secondary: '#151515',
        success: '#05C715',
        error: '#FF1500',
        validation: '#FFE5E5',
        // white: colors.white,
        light: '#E4F1FF',
        // gray: colors.slate,
        dark: '#333333',
        // black: colors.black,
        // green: colors.emerald,
        // yellow: colors.amber,
        // red: colors.red,
      },
      fontSize: {
        xxs: '.65rem',
      },
      height: {
        editor: 'calc(-9rem + 100vh)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
