const {style} = require('../utils')

/**
 * Usage
 *
 * @param {string} version FBI version
 * @returns
 */
exports.usage = version => {
  return `
  FBI v${version}

  ${style.bold('Usage: ')} fbi <command>|<task> [options] 

  ${style.bold('Commands: ')}

    add <repo> [<repo> ...]         Add templates and tasks from remote repositories
    init                            Create a new project or task based on the specified template
    use <name>                      Specify the template for the current local project
    i,  install [pkg] [-t, -g, -a]  Install dependencies intelligently
    ls, list                        Show all available local templates and tasks
    rm, remove <name>               Remove local template or task
    up, update <name>               Update template or task from remote repository
    set                             Set FBI configs
    reset                           Reset FBI configs

    ${style.grey('Examples:')}
    ${style.italic(
      style.grey(`$ fbi add git@github.com/xxx/fbi-template-fullpack.git git@github.com/xxx/fbi-task-serve.git
    $ fbi init fullpack
    $ fbi use 2.0.0
    $ fbi ls
    $ fbi ls config
    $ fbi ls store`)
    )}
  
  ${style.bold('Modes: ')}
  
    -D, --debug                     Execute fbi in debug mode
    -T, --template                  Executes the task in template mode
    -G, --global                    Executes the task in global mode
    -P, --parallel                  Executes the tasks in parallel mode

    ${style.grey('Examples:')}
    ${style.italic(
      style.grey(`$ fbi build --debug
    $ fbi build -T=fullpack
    $ fbi build build1 build2 build3 -P`)
    )}
  
  ${style.bold('Options: ')}
  
    -h, --help                      Display help information
    -v, --version                   Display fbi version number
`
}
