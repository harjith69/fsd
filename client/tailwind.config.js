/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#F4F6FF',
          100: '#EEF0FF',
          200: '#DDE2FF',
          300: '#B9C3FF',
          400: '#8E9DFF',
          500: '#5B6CFF',
          600: '#4A59E8',
          700: '#3843C4',
          800: '#2E369E',
          900: '#1B2140',
        },
        canvas: '#F7F8FC',
        card: '#FFFFFF',
        accent: {
          mint: '#2EC4A6',
          peach: '#FFB88C',
          sky: '#6EC1FF',
          rose: '#FF7A93',
          lavender: '#EEF0FF',
        },
        content: {
          title: '#1B2140',
          body: '#4A5170',
          muted: '#8A91AD',
        },
        border: {
          soft: '#ECEEF7',
        },
      },
      boxShadow: {
        card: '0 8px 30px rgba(91, 108, 255, 0.06)',
        'card-hover': '0 14px 38px rgba(91, 108, 255, 0.12)',
        soft: '0 4px 20px rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
