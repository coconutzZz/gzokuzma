import flowbite from 'flowbite/plugin'
module.exports = {
  content: [
    './components/**/*.{vue,js}',
    './layouts/**/*.{vue,js}',
    './pages/**/*.{vue,js}',
    './app.vue',
    'storyblok/**/*.{vue,js}',
    './node_modules/flowbite/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}'
  ],
  theme: {
    screens: {
      sm: '576px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          50:  '#f5f6fa',
          100: '#e0e2f0',
          200: '#c2c5e1',
          300: '#a3a8d1',
          400: '#858bc2',
          500: '#262C69', // Base color
          600: '#525a8f',
          700: '#3e456b',
          800: '#2a3147',
          900: '#161c24',
        },
        secondary: '#FF6246', 
        accent: '#FBC702',    // Amber
        neutral: '#BFC6FF',   // Gray
        success: '#10B981',   // Green
        warning: '#FBBF24',   // Yellow
        danger: '#EF4444',    // Red
      },
    },
  },  
}