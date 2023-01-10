module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testURL: 'http://localhost',
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.ts$',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'js'],
};
