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
    // modify the webpack config however you'd like to by adding to this object
    entry: ['./src/singleSpaEntry.tsx'],
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
          use: [
            '@svgr/webpack',
            'url-loader'
          ]
        }
      ],
    },
    resolve: {
      alias: {
        '@app': path.resolve(__dirname, 'src'),
      }
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
      new webpack.DefinePlugin(envKeys),
    ],
  });
};
