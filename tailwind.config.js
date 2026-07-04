/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F5F2EB',
        green: {
          DEFAULT: '#1A3C28',
          mid: '#2D5A3D',
          soft: '#4A7C5C',
          pale: '#E6F2EB',
          xpale: '#F0F7F3',
        },
        ocre: {
          DEFAULT: '#B8760A',
          pale: '#FDF0D8',
        },
        border: '#DDE8DF',
        text: {
          DEFAULT: '#1A2E1C',
          mid: '#4A5E4C',
          light: '#8A9E8E',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        sm: '10px',
        md: '16px',
        lg: '20px',
        xl: '24px',
      },
    },
  },
  plugins: [],
};
