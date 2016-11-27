module.exports = (require, ctx) => {
  return {
    include: ['./src/**/*.js'],
    extends: 'standard',
    env: {
      node: true
    },
    parserOptions: {
      ecmaVersion: 2017,
      sourceType: 'module',
      ecmaFeatures: {}
    },
    rules: {
      'arrow-parens': [2, 'as-needed'],
      'space-before-function-paren': 0,
      'one-var': 0
    }
  }
}