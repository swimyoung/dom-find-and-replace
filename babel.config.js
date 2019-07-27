module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        targets: 'last 2 versions',
      },
    ],
  ],
  plugins: ['@babel/plugin-transform-runtime'],
};
