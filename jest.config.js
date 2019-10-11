module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'enzyme',
  bail: false,
  testMatch: ['<rootDir>/tests/**/*.spec.ts?(x)'],
  setupFilesAfterEnv: ['jest-enzyme'],
  testEnvironmentOptions: {
    enzymeAdapter: 'react16',
  },
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text-summary', 'lcov'],
};
