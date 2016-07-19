export default {
  paths: {
    tasks: './tasks/',
    starters: '../tmpls/starters/',
    settings: 'default.config.js',
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
    protocol: 'localhost',
    port: 6666
  }
}
