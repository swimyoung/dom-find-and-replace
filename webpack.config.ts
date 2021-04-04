// tsconfig module is esnext so that require syntax is required
/* eslint-disable  @typescript-eslint/no-var-requires */

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');

const { NODE_ENV = 'development' } = process.env;
const isProductionMode = NODE_ENV === 'production';
const hash = isProductionMode ? 'contenthash' : 'hash';

module.exports = {
  entry: `${__dirname}/src/index.ts`,
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    path: `${__dirname}/dist`,
    filename: `[name].[${hash}].js`,
    chunkFilename: `[name].[${hash}].js`,
    hashDigestLength: 5,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: 'file-loader',
      },
    ],
  },
  optimization: {
    splitChunks: { chunks: 'all' },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: `[name].[${hash}].css`,
    }),
    new HTMLWebpackPlugin({
      template: `src/index.html`,
      filename: `index.html`,
    }),
  ],
  mode: isProductionMode ? 'production' : 'development',
  devtool: isProductionMode ? 'source-map' : 'inline-source-map',
};
