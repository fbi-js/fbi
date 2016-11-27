import {
  colors
} from './utils'

export default `
    Usage:

      fbi [command]           run command
      fbi [task]              run a local preference task
      fbi [task] -g           run a global task
      fbi [task] -t           run a template task

      ${colors().yellow('use \'fbi ls\' to check available tasks & templates')}

    Commands:

      ata,   add-task [name]          add task file of files in 'fbi' folder
      atm,   add-tmpl                 add current folder as a template
      rta,   rm-task  [-t] [name]     remove task
      rtm,   rm-tmpl  [name]          remove template
      i,     install                  install dependencies
      ls,    list                     list all tasks & templates
      cat    [task]   [-t, -g]        cat task content
      init   [template]               init a new project via template
      backup                          backup tasks & templates to current folder
      recover                         recover tasks & templates from current folder
      update                          update current local project with fbi template
                                      ${colors().magenta('(this will overwrite local "fbi" folder and "devDependencies" in package.json)')}

      -h,    --help                   output usage information
      -v,    --version                output the version number
`
