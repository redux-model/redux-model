module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'enzyme',
  bail: false,
  testMatch: [
    '<rootDir>/tests/models/*.spec.ts?(x)',
    `<rootDir>/tests/${process.env.TEST_PLATFORM}/**/*.spec.ts?(x)`,
  ],
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
    '<rootDir>/src/vue',
  ],
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text-summary', 'lcov'],
  testURL: 'https://registry.npmjs.org',
};
