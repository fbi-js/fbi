const _ = require('./utils')

module.exports = version => {
  return `
    FBI v${version}

    Usage:
      fbi <command>           run a command
      fbi <task>              run a local-pref task
      fbi <task> -t           run a template task
      fbi <task> -g           run a global task

      ${_.style.yellow("Use 'fbi ls' to check available tasks & templates")}

    Commands:
      clone <repo1 repo2>             Clone git repositories as FBI tasks or templates
      pull <template name>            Update tasks or templates from remote repositories
      l, ls, list                     List all available tasks & templates
      ata, add-task                   Add tasks
      rta, rm-task [-t, -g] [name]    Remove a global(-g) or template(-t) task
      atm, add-tmpl                   Add current folder as a template
      rtm, rm-tmpl [name]             Remove a template
      init <template name>            Init a new project via template
      i, install                      Install dependencies & devDependencies
      cat [task] [-t, -g]             Cat task content
      backup                          Backup tasks & templates to current folder
      recover                         Recover tasks & templates from current folder

    Options:
      -h,    --help                   Output usage information
      -v,    --version                Output FBI's version number
      --debug                         Debug mode
`
}
