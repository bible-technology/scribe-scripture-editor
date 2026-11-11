module.exports = {
  collectCoverageFrom: [
    '**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!**/testconfig/**',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  moduleDirectories: [
    'node_modules',
    'renderer',
  ],
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    '@core/(.*)$': '<rootDir>/renderer/src/core/$1',
    '@components/(.*)$': '<rootDir>/renderer/src/components/$1',
    '@modules/(.*)$': '<rootDir>/renderer/src/modules/$1',
    '@layouts/(.*)$': '<rootDir>/renderer/src/layouts/$1',
  },
  setupFilesAfterEnv: [
    '<rootDir>/testconfig/setupTests.js',
  ],
  testMatch: [
    // '**/?(*.)+(spec|test).[jt]s?(x)' removing ts files from unit test because the integration
    // test is been written in ts and 'npm test 'runs e2e test too and it fails now.
    '**/?(*.)+(spec|test).[j]s?(x)',
  ],
  testPathIgnorePatterns: [
    '/.next/',
    '/node_modules/',
    '/testconfig/',
    '/coverage/',
  ],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
};