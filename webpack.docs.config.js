const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const production = process.env.NODE_ENV === 'production';
const hash = production ? 'contenthash' : 'hash';

module.exports = {
  entry: `${__dirname}/src/docs/index.ts`,
  output: {
    path: `${__dirname}/docs`,
    filename: `[name].[${hash}].js`,
  },
  resolve: {
    extensions: ['.ts', '.js'],
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
  plugins: [
    ...(production ? [new CleanWebpackPlugin()] : []),
    new MiniCssExtractPlugin({
      filename: `[name].[${hash}].css`,
    }),
    new HTMLWebpackPlugin({
      template: `${__dirname}/src/docs/index.html`,
    }),
  ],
  mode: production ? 'production' : 'development',
  devtool: production ? false : 'inline-source-map',
  devServer: {
    contentBase: 'docs',
  },
};
