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
        browsers: ['last 12 version',
        '> 1%',
        'maintained node versions',
        'not dead'],
      },
  ],
};