module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^.+\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'] }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(openai|formdata-node|node-fetch|fetch-blob|data-uri-to-buffer|web-streams-polyfill|formdata-polyfill)/)'
  ],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
}; 