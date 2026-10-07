const expoPreset = require('jest-expo/jest-preset');

module.exports = {
  preset: 'jest-expo',
  testEnvironmentOptions: { customExportConditions: ['node', 'node-addons'] },
  setupFilesAfterEnv: ['<rootDir>/jest.polyfills.cjs', '<rootDir>/jest.setup.ts'],
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}', '<rootDir>/scripts/**/*.test.cjs'],
  moduleNameMapper: {
    '^@styles$': '<rootDir>/src/test/style-mock.cjs',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.css$': '<rootDir>/src/test/style-mock.cjs',
  },
  transform: { '\\.mjs$': expoPreset.transform['\\.[jt]sx?$'] },
  transformIgnorePatterns: expoPreset.transformIgnorePatterns.map((pattern) =>
    pattern.replace(
      'standard-navigation',
      'standard-navigation|@rn-primitives|msw|@msw|@open-draft|until-async|rettime|cookie'
    )
  ),
  testTimeout: 30000,
};
