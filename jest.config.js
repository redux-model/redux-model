module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: [
    "<rootDir>/packages/**/tests/**/*.spec.ts?(x)"
  ],
  collectCoverageFrom: [
    '<rootDir>/packages/**/src/**/*.ts?(x)',
    '!**/build/**',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text-summary', 'lcov'],
  testURL: 'https://registry.npmjs.org',
};
