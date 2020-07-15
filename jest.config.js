module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    "<rootDir>/packages/**/tests/**/*.spec.ts?(x)"
  ],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '<rootDir>/packages/**/src/**/*.ts',
    '!**/build/**',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text-summary', 'lcov'],
  testURL: 'https://registry.npmjs.org',
};
