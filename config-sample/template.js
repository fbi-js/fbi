// fbi/config.js
module.exports = {
  template: 'Template name',
  description: 'Description of template',
  npm: {
    alias: 'npm',
    options: ''
  },
  alias: {
    b: 'build',
    s: 'serve'
  },
  paths: {
    tasks: 'fbi',
    config: 'fbi/config.js'
  },
  server: {
    host: 'localhost',
    port: 9000,
    root: '.'
  },
  DATA_ROOT: 'data',
  DATA_TASKS: 'data/tasks',
  DATA_TEMPLATES: 'data/templates',
  TASK_PARAM_PREFIX: '-',
  TEMPLATE_ADD_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist'],
  TEMPLATE_INIT_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist'],
  BACKUP_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist'],
  RECOVER_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist']
}

// package.json
// 1. simple
/*
  "fbi": {
    "template": "mod"
  }
*/

// 2.
/*
  "fbi": {
    "template": "mod",
    "description": "Description of template",
    "paths": {
      "tasks": "build",
      "config": "build/config.js"
    }
  }

  Put task files in 'build/'
*/