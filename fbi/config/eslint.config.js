ctx.nodeModulesPath = ctx.options.node_modules_path
module.exports = {
  include: ['./src/**/*.js'],
  extends: ctx.nodeModulesPath + '/eslint-config-airbnb-base',
  env: {
    node: true
  },
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {}
  },
  rules: {
    semi: [2, 'never'], // 行尾不要使用分号
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'arrow-parens': [2, 'as-needed'],
    'space-before-function-paren': 0,
    'one-var': 0,
    'comma-dangle': 0, // 对象最后一项 不使用逗号
    'no-console': [0], // 可以使用console
    'no-param-reassign': [0], // https://github.com/airbnb/javascript#functions--mutate-params
    'no-octal-escape': 0
  }
}
