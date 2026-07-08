/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  moduleNameMapper: {
    '^expo-crypto$': '<rootDir>/src/test-utils/mocks/expo-crypto.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
