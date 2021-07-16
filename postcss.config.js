const createPostcssConfig = require('@gpn-prototypes/frontend-configs/postcss.config');

module.exports = {
  // eslint-disable-next-line global-require
  plugins: [...createPostcssConfig().plugins],
};
