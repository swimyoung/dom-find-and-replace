const HTMLWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const ENV_IS_PRODUCTION = process.env.NODE_ENV === 'production';
const hash = ENV_IS_PRODUCTION ? 'contenthash' : 'hash';
const outputPath = `${__dirname}/bundle`;

module.exports = {
  entry: `${__dirname}/src/index.js`,
  output: {
    path: outputPath,
    filename: `[name].[${hash}].js`,
    chunkFilename: `[name].[${hash}].js`,
    hashDigestLength: 5,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
      {
        test: /\.js[x]?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            extends: `${__dirname}/../babel.config.js`,
            presets: [
              '@babel/react',
              [
                '@babel/preset-env',
                {
                  modules: false,
                  targets: {
                    browsers: ['last 2 versions'],
                  },
                },
              ],
            ],
          },
        },
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  plugins: [
    ...(ENV_IS_PRODUCTION ? [new CleanWebpackPlugin()] : []),
    new HTMLWebpackPlugin({
      template: `${__dirname}/src/index.html`,
      filename: '../index.html',
    }),
  ],
  mode: process.env.NODE_ENV,
  devtool: ENV_IS_PRODUCTION ? 'source-map' : 'inline-source-map',
};
