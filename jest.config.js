const path = require('path');

const setupTestFile = path.resolve('setup-tests.ts');

const config = require('@gpn-prototypes/frontend-configs/jest/jest.config')({
  setupFilesAfterEnv: setupTestFile,
});

module.exports = {
  ...config,
  modulePathIgnorePatterns: [...config.modulePathIgnorePatterns, '/e2e-tests/'],
  coveragePathIgnorePatterns: [
    ...config.coveragePathIgnorePatterns,
    '/e2e-tests/',
    '/src/set-public-path.tsx',
    '/src/singleSpaEntry.tsx',
    '/src/App/index.tsx',
    '/src/assets/icons/',
    '/src/constants/',
    '/src/interfaces/',
    '/src/model/',
    '/src/store/',
    '/src/hooks/',
    '/src/config/',
    '/app-config/',
  ],
  transformIgnorePatterns: ['node_modules/?!(@gpn-prototypes)/'],
  moduleNameMapper: {
    ...config.moduleNameMapper,
    '^@vega(.*)$': '<rootDir>/src$1',
    '^@app(.*)$': '<rootDir>/src$1',
  },
};
