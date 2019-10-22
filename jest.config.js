module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'enzyme',
  bail: false,
  testMatch: ['<rootDir>/tests/**/*.spec.ts?(x)'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['jest-enzyme'],
  testEnvironmentOptions: {
    enzymeAdapter: 'react16',
  },
  coveragePathIgnorePatterns: [
    '<rootDir>/tests',
    '/node_modules/',
    '<rootDir>/src/web',
    '<rootDir>/src/taro',
    '<rootDir>/src/react-native',
  ],
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text-summary', 'lcov'],
};
