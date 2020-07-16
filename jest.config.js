module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    "<rootDir>/packages/**/tests/**/*.spec.ts?(x)"
  ],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts?(x)',
    '<rootDir>/packages/**/src/**/*.ts?(x)',
    '!**/build/**',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text-summary', 'lcov'],
  testURL: 'https://registry.npmjs.org',
};
