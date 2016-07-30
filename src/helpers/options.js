import { merge } from './utils'

export const defaultOptions = {
  // template: 'basic',
  task_param_prefix: '-',
  paths: {
    tasks: 'fbi/',
    options: 'fbi/config.js'
  },
  server: {
    root: './',
    host: 'localhost',
    port: 8888
  },
  npm: {
    alias: 'npm',
    // options:'--save-dev --registry=https://registry.npm.taobao.org'
    options: '--save-dev'
  }
}

export function getOptions(opts) {
  return merge(defaultOptions, opts || {})
}