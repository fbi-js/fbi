module.exports = {
  paths: {
    tasks: 'fbi',
    config: 'fbi/config.js'
  },
  server: {
    host: 'localhost',
    port: 9000,
    root: '.'
  },
  // compile ES7 to ES6
  compiler: {
    name: 'compile',
    // for buble
    compile: {
      transforms: {
        arrow: false,
        classes: false,
        defaultParameter: false,
        destructuring: false,
        forOf: false,
        generator: false,
        letConst: false,
        parameterDestructuring: false,
        spreadRest: false,
        templateString: false,
      },
      objectAssign: 'Object.assign'
    },
    // for rollup
    generate: {
      format: 'cjs'
    }
  },
  DATA_ROOT: 'data',
  DATA_TASKS: 'data/tasks',
  DATA_TEMPLATES: 'data/templates',
  TASK_PARAM_PREFIX: '-',
  TEMPLATE_ADD_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist'],
  TEMPLATE_INIT_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist', 'package.json', 'fbi'],
  BACKUP_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist'],
  RECOVER_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist']
}