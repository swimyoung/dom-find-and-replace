module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: 'cjs',
        targets: 'last 2 versions',
      },
    ],
  ],
  plugins: ['@babel/plugin-transform-runtime'],
};
