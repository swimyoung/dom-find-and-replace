const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const dev = process.env.NODE_ENV === 'development';
const hash = dev ? 'hash' : 'contenthash';

module.exports = {
  entry: `${__dirname}/src/index.js`,
  output: {
    path: `${__dirname}/bundle`,
    filename: `[name].[${hash}].js`,
    chunkFilename: `[name].[${hash}].js`,
    hashDigestLength: 5,
  },
  module: {
    rules: [
      {
        test: /\.scss|\.css/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.js[x]?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            extends: `${__dirname}/../babel.config.js`,
            presets: [
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
    ...(dev ? [] : [new CleanWebpackPlugin()]),
    new MiniCssExtractPlugin({
      filename: `[name].[${hash}].css`,
    }),
    new HTMLWebpackPlugin({
      template: `${__dirname}/src/index.html`,
      filename: `${dev ? '' : '../'}index.html`,
    }),
  ],
  mode: dev ? 'development' : 'production',
  devtool: dev ? 'inline-source-map' : 'source-map',
  devServer: {
    contentBase: 'docs',
  },
};
