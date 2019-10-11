module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'enzyme',
  bail: false,
  testMatch: ['<rootDir>/tests/**/*.spec.ts?(x)'],
  setupFilesAfterEnv: ['jest-enzyme'],
  testEnvironmentOptions: {
    enzymeAdapter: 'react16',
  },
  coveragePathIgnorePatterns: ['<rootDir>/tests', '/node_modules/'],
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text-summary', 'lcov'],
};
