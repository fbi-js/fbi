export default {
  PATHS: {
    local: {
      tasks: 'fbi/',
      config: 'fbi/config.js'
    },
    global: {
      root: 'data',
      tasks: 'data/tasks',
      templates: 'data/templates'
    }
  },
  TASK_PARAM_PREFIX: '-',
  TEMPLATE_ADD_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist'],
  TEMPLATE_INIT_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist'],
  BACKUP_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist'],
  RECOVER_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist']
}
