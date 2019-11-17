const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const production = process.env.NODE_ENV === 'production';
const hash = production ? 'contenthash' : 'hash';

module.exports = {
  entry: [
    'normalize.css',
    `${__dirname}/src/index.css`,
    `${__dirname}/src/index.js`,
  ],
  output: {
    path: `${__dirname}/bundles`,
    filename: `[name].[${hash}].js`,
    chunkFilename: `[name].[${hash}].js`,
    hashDigestLength: 5,
  },
  module: {
    rules: [
      {
        test: /\.css/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ],
  },
  optimization: { splitChunks: { chunks: 'all' } },
  plugins: [
    ...(production ? [new CleanWebpackPlugin()] : []),
    new MiniCssExtractPlugin({
      filename: `[name].[${hash}].css`,
    }),
    new HTMLWebpackPlugin({
      template: `${__dirname}/src/index.html`,
      filename: `${production ? '../' : ''}index.html`,
    }),
  ],
  mode: production ? 'production' : 'development',
  devtool: production ? false : 'inline-source-map',
  devServer: {
    contentBase: 'docs',
  },
};
