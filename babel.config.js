module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: process.env.NODE_ENV === 'test' ? 'cjs' : false,
        targets: 'last 2 versions',
      },
    ],
  ],
  plugins: ['@babel/plugin-transform-runtime'],
};
