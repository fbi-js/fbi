import {merge} from './utils'

export const defaultOptions = {
  template: 'basic',
  paths: {
    data: './data',
    data_tasks: './data/tasks',
    data_templates: './data/templates',
    options: 'fbi/config.js',
    tasks: 'fbi/tasks.js',
    starters: '../tmpls/starters/',
    settings: 'default.config.js'
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