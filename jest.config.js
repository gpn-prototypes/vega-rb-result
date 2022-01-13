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
    '/src/App/App.tsx',
    '/src/assets/icons/',
    '/src/constants/',
    '/src/interfaces/',
    '/src/model/',
    '/src/store/',
    '/src/hooks/',
    '/src/operators/',
    '/src/generated/',
    '/src/services/',
    '/src/config/',
    '/app-config/',
    'index.ts',
    'drawUtils.ts',
    'Providers.tsx',
    'ProjectProvider.tsx',
    'queries.ts',
    'mutations.ts',
    'types.ts',
    '/__tests__/',
    'cn-alert.ts',
    'cn-chart.ts',
    'cn-table-result-rb.ts',
    'cn-table-error-alert.ts',
    'cn-tree-editor.ts',
    'DrawHelper.ts',
    'LocalStorageHelper.ts',
    'diffPatcher.ts',
    'ErrorBoundary.tsx',
    'RecentlyEditedAlert.tsx',
  ],
  transformIgnorePatterns: ['node_modules/?!(@gpn-prototypes)/'],
  moduleNameMapper: {
    ...config.moduleNameMapper,
    '^@vega(.*)$': '<rootDir>/src$1',
    '^@app(.*)$': '<rootDir>/src$1',
  },
};
