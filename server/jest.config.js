module.exports = {
  testEnvironment: 'node',
  setupFilesAfterFramework: [],
  globalSetup: undefined,
  globalTeardown: undefined,
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/server.js'],
  coverageReporters: ['text', 'lcov'],
  testTimeout: 30000,
};
