const { NODE_ENV } = process.env;
const config = {
  presets: [
    ['@babel/preset-env', { targets: { browsers: ['last 2 versions'] } }],
  ],
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime',
    'lodash',
  ],
};

if (NODE_ENV === 'production') {
  config.plugins.push('transform-remove-console', 'transform-remove-debugger');
}

module.exports = config;
