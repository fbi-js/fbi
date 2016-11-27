
/*
  fbi v2.1.2
  Node.js workflow tool.

  Author: neikvon
  Built:  2016-11-28 00:00:44 via fbi

  Copyright 2016 neikvon
*/
'use strict';

var options = {
  task_param_prefix: '-',
  paths: {
    tasks: 'fbi/',
    config: 'fbi/config.js'
  },
  data: {
    root: './data',
    tasks: './data/tasks',
    templates: './data/templates'
  },
  server: {
    root: './',
    host: 'localhost',
    port: 8888
  },
  npm: {
    alias: 'npm',
    options: ''
  },
  TEMPLATE_ADD_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist'],
  TEMPLATE_INIT_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist'],
  BACKUP_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist'],
  RECOVER_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist']
};

module.exports = options;
