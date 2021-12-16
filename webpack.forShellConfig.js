const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const singleSpaDefaults = require('webpack-config-single-spa-react-ts');
const ImportMapPlugin = require('webpack-import-map-plugin');
const { getAppConfig } = require('./app-config');
const path = require('path');
const dotenv = require('dotenv');

const { projectName } = getAppConfig();

module.exports = (webpackConfigEnv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: 'vega',
    projectName,
    webpackConfigEnv,
  });

  const envConfig = dotenv.config();

  const env = envConfig.error ? {} : envConfig.parsed;

  const envKeys = Object.keys(env).reduce((prev, next) => {
    // eslint-disable-next-line no-param-reassign
    prev[`process.env.${next}`] = JSON.stringify(env[next]);
    return prev;
  }, {});

  return webpackMerge.smart(defaultConfig, {
    entry: ['./src/singleSpaEntry.tsx'],
    mode: 'production',
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif)$/i,
          use: [
            {
              loader: 'file-loader',
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: 'postcss-loader',
            },
          ],
        },
        {
          test: /\.svg$/,
          use: ['@svgr/webpack', 'url-loader'],
        },
      ],
    },
    resolve: {
      alias: {
        '@app': path.resolve(__dirname, 'src'),
      },
    },
    plugins: [
      new ImportMapPlugin({
        fileName: 'import-map.json',
        baseUrl: process.env.BASE_URL,
        filter(x) {
          return ['main.js'].includes(x.name);
        },
        transformKeys(filename) {
          if (filename === 'main.js') {
            return `@vega/${projectName}`;
          }

          return undefined;
        },
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
        'process.env.YC_DEPLOYMENT': JSON.stringify(YC_DEPLOYMENT),
        'process.env.AVAILABLE_RB_RESULT': JSON.stringify(AVAILABLE_RB_RESULT),
        'process.env.AVAILABLE_LC': JSON.stringify(AVAILABLE_LC),
        'process.env.AVAILABLE_FEM': JSON.stringify(AVAILABLE_FEM),
        'process.env.BASE_API_URL': JSON.stringify(process.env.BASE_API_URL),
        'process.env.BASE_URL': JSON.stringify(BASE_URL),
        'process.env.VEGA_ENV': JSON.stringify(VEGA_ENV),
        ...envKeys,
      }),
    ],
  });
};
