module.exports = {
  // eslint-disable-next-line global-require
  plugins: ['stylelint-scss'],
  ...require('@gpn-prototypes/frontend-configs/stylelintrc'),
  rules: {
    'length-zero-no-unit': true,
  },
};
