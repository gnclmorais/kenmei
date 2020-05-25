const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  separator: '_',
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      'max-sm': { max: '640px' },
      'max-md': { max: '768px' },
      'max-lg': { max: '1024px' },
      'max-xl': { max: '1280px' },
    },
    minHeight: {
      0: '0',
      '1/4': '25%',
      '1/2': '50%',
      '3/4': '75%',
      45: '45rem',
      full: '100%',
    },
    extend: {
      transitionDelay: {
        0: '0ms',
      },
      colors: {
        'el-green': '#67C23A',
        'el-green-light': '#85CE61',
      },
      margin: {
        '10px': '0.65rem',
      },
      fontFamily: {
        inter: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  variants: {},
  plugins: [
    require('@tailwindcss/ui'),
  ],
};
