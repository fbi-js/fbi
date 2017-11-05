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
  DATA_ROOT: '.fbi',
  TASK_PREFIX: 'fbi-task-',
  TEMPLATE_PREFIX: 'fbi-template-',
  INFO: 'info.json',
  TASK_PARAM_PREFIX: '-',
  TEMPLATE_ADD_IGNORE: [
    'node_modules',
    '.DS_Store',
    '.svn',
    '.git',
    'dst',
    'dist'
  ],
  TEMPLATE_INIT_IGNORE: [
    'node_modules',
    '.DS_Store',
    '.svn',
    '.git',
    'dst',
    'dist',
    'package.json',
    'fbi'
  ],
  BACKUP_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist'],
  RECOVER_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist']
}
