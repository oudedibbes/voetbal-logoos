module.exports = {
  plugins: [
    require('postcss-100vh-fix'),
    require('autoprefixer'),
    'postcss-preset-env': {
        stage: 0
      },
      'postcss-dark-theme-class': {
        darkSelector: '[data-theme='dark']',
        lightSelector: '[data-theme='light']'
      }
    autoprefixer: {
        browsers: [
          ">0.2%",
          "not dead",
          "not op_mini all"
        ],
      },
  ],
};