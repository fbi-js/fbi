import { colors } from './utils'

export default version => {
  return `
    FBI v${version}

    Usage:

      fbi [command]           run command
      fbi [task]              run a local preference task
      fbi [task] -t           run a template task
      fbi [task] -g           run a global task

      ${colors().yellow('use \'fbi ls\' to check available tasks & templates')}

    Commands:

      ls,    list                     list all available tasks & templates

      ata,   add-task [name]          add tasks
      rta,   rm-task  [-t] [name]     remove task
      atm,   add-tmpl                 add current folder as a template
      rtm,   rm-tmpl  [name]          remove template

      init   [template]               init a new project via template
      i,     install                  install dependencies & devDependencies

      cat    [task]   [-t, -g]        cat task content
      backup                          backup tasks & templates to current folder
      recover                         recover tasks & templates from current folder

      -h,    --help                   output usage information
      -v,    --version                output the version number
`
}
