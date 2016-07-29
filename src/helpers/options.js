import { merge } from './utils'

export const defaultOptions = {
  // template: 'basic',
  paths: {
    tasks: 'fbi/',
    options: 'fbi/config.js'
  },
  meta: {
    src: {
      root: 'src',
      html: 'tmpl',
      css: 'style',
      js: 'script',
      img: 'image'
    },
    dist: {
      root: 'dist',
      html: '.',
      css: 'css',
      js: 'js',
      img: 'img'
    },
    archive: 'archive'
  },
  server: {
    host: 'localhost',
    port: 8888
  },
  npm:{
    alias:'npm',
    // options:'--save-dev --registry=https://registry.npm.taobao.org'
    options:'--save-dev'
  }
}

export function getOptions(opts) {
  return merge(defaultOptions, opts || {})
}