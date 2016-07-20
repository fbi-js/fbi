var cfg = {
  _: {
    cwd: '[Function: cwd]',
    join: '[Function: join]',
    dir: '[Function: dir]',
    exist: '[Function: exist]',
    existSync: '[Function: existSync]',
    merge: '[Function: merge]',
    validJson: '[Function: validJson]',
    write: '[Function: write]'
  },
  config: {
    paths: {
      tasks: './data/tasks',
      starters: '../tmpls/starters/',
      settings: 'default.config.js',
      options: 'fbi/config.js'
    },
    meta: {
      src: [Object], dist: [Object], archive: 'archive'
    },
    server: {
      protocol: 'localhost', port: 6666
  } },
  log: '[Function: log]',
  user: [],
  tasks: {
    new: {
      desc: 'create a fbi project', short: 'n', module: 'pm2'
    },
    build: {
      desc: 'build the fbi project',
      short: 'b',
      module: 'fbi-build'
    },
    serve: {
      desc: 'serve the project or files',
      short: 's',
      module: 'gulp'
    },
    custom: {
      desc: 'custom command',
      short: 'c',
      module: '../data/tasks/custom.js'
    },
    customB: {
      desc: 'custom command', short: 'bbb', module: 'slash'
    }
  },
  templates: {
    h5pc: 'http://google.com/h5pc',
    h5mobile: 'http://google.com/h5pc',
    vue: 'http://google.com/h5pc',
    react: 'http://google.com/h5pc',
    angular: 'http://google.com/h5pc',
    cusT1: 'http://google.com/h5pc',
    cusT2: 'http://google.com/h5pc'
  },
  argvs: [ 'rm', 'customA' ],
  isFbi: false
}
