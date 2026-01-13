module.exports = {
  root: true,
  env: {
    browser: false,
    es2021: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  plugins: ['@typescript-eslint', 'eslint-plugin-n8n-nodes-base'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:eslint-plugin-n8n-nodes-base/community',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'n8n-nodes-base/community-package-json-name-still-default': 'off',
    'no-console': 'warn',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '*.js',
    '*.d.ts',
    'gulpfile.js',
    'test/**/*.ts',
  ],
};
