const _ = require('./utils')

module.exports = version => {
  return `
    FBI v${version}

    Usage:

      fbi [command]           run command
      fbi [task]              run a local-pref task
      fbi [task] -t           run a template task
      fbi [task] -g           run a global task

      ${_.style.yellow('Use \'fbi ls\' to check available tasks & templates')}

    Commands:

      ls,    list                     List all available tasks & templates

      ata,   add-task [name]          Add tasks
      rta,   rm-task  [-t] [name]     Remove a task
      atm,   add-tmpl                 Add current folder as a template
      rtm,   rm-tmpl  [name]          Remove a template

      init   [template]               Init a new project via template
      i,     install                  Install dependencies & devDependencies

      cat    [task]   [-t, -g]        Cat task content
      backup                          Backup tasks & templates to current folder
      recover                         Recover tasks & templates from current folder

      -h,    --help                   Output usage information
      -v,    --version                Output the version number
`
}