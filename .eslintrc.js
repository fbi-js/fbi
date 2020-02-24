module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint'
  ],
  rules: {
    // 0 = off, 1 = warn, 2 = error
    // '@typescript-eslint/no-explicit-any': 1
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-this-alias': 0,
    'no-empty': 0,
    'no-prototype-builtins': 0
  }
}
