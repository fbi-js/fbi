<div align="center">
  <h3 style="color:#48abd6;font-weight:600;">F B I</h3>
  <p style="font-size:16px;">Node.js workflow tool</p>
</div>

**Requirement: node v4.0+, npm v3.0+**

**Recommend: node v6.0+, npm v3.10+**

[中文版说明](./README_zh-cn.md)

## Features

* Tasks Management -  manage your js files as global tasks
* Templates Management - reuse projects as global templates
* node_modules Management - host devDependencies away from project's folder, and, it's faster
* Lightweight, No dependencies

## Installation

```bash
$ npm i -g fbi
```


## Usage

```bash
$ fbi [task]              # run a local preference task
$ fbi [task] -g           # run a global task
$ fbi [task] -t           # run a template task

use 'fbi ls' to see available tasks & templates
```

```bash
$ fbi ata,   add-task [name]          # add task file of files in 'fbi' folder
$ fbi atm,   add-tmpl                 # add current folder as a template
$ fbi rta,   rm-task  [-t] [name]     # remove task
$ fbi rtm,   rm-tmpl  [name]          # remove template
$ fbi i,     install                  # install dependencies
$ fbi ls,    list                     # list all tasks & templates
$ fbi cat    [task]   [-t, -g]        # cat task content
$ fbi init   [template]               # init a new project via template
$ fbi backup                          # backup tasks & templates
$ fbi recover                         # recover tasks & templates from current folder

$ fbi -h,    --help                   # output usage information
$ fbi -v,    --version                # output the version number
```

## Quick Start

### Add task

[see full demo](https://github.com/neikvon/fbi-tasks-demo)


```js
// ./project/fbi/showtime.js

console.log(new Date())
```
```bash
$ cd path/to/project/

$ fbi ata   # short for 'fbi add-task'
```
```bash
$ fbi showtime

# output:
# FBI => Running global task "showtime"...
# 2016-08-03T09:06:28.349Z
```
`fbi` will add the `.js` files in `./fbi` folder to fbi's global tasks folder.

### Add template

[see full demo](https://github.com/neikvon/fbi-template-webpack2)

```bash
|-- proj-name
|--   src
|--     index.html
|--     css/
|--     js/
|--     img/
|--   fbi
|--     config.js
|--     build.js
|--   package.json

```
```js
// config.js
module.exports = {
  template: 'webpack-demo', // required, template name
  templateDescription: 'template description',
  alias: {
    b: 'build' // task name alias
  }
}
```
```js
// build.js
/**
 * global vars:
 * ctx => fbi
 * require => requireResolve
 */
const webpack = require('webpack')
const webpackConfig = {
  ...
}

const isProduction = ctx.taskParams && ctx.taskParams[0] === 'p' // fbi build -p

if (isProduction) {
  ctx.log('env: production')
  webpackConfig['plugins'].push(
    new webpack.optimize.UglifyJsPlugin({ // js ugllify
      compress: {
        warnings: false
      }
    })
  )
}

webpack(webpackConfig, (err, stats) => {
  if (err) {
    ctx.log(err, 0)
  }

  ctx.log(`webpack output:
${stats.toString({
      chunks: false,
      colors: true
    })}`)
})
```

**install**
```bash
$ npm i               # install dependencies
```

**test**
```bash
$ fbi b
```

**add**
```bash
$ fbi atm             # fbi will use the name in 'config.js=>template' as template name
```

**check**
```bash
$ fbi ls              # see available Tasks & Templates
```

### Demos
1. [tasks-demo](https://github.com/neikvon/fbi-tasks-demo)
1. [template-vue2](https://github.com/neikvon/fbi-template-vue2)
1. [template-webpack2](https://github.com/neikvon/fbi-template-webpack2)
1. [template-webpack1](https://github.com/neikvon/fbi-template-webpack1) ( Compatible with fbi v1.x )

### [Change log](https://github.com/neikvon/fbi/blob/master/CHANGELOG.md)

### Teamwork

* Create a remote git repository ` fbi-data `，repository structure：


  ```
|-- fbi-data
|--   tasks
|--     fbi
|--       task1.js
|--       task2.js
|--       ...
|--     package.json
|--     node_modules
|--
|--   templates
|--     template1
|--       fbi
|--         task1.js
|--         task2.js
|--       src
|--       package.json
|--       node_modules
|--       README.md
|--     template2
|--     ...
  ```

* clone
```bash
$ fbi clone git@path/to/remote/fbi-data.git
```
Tips: `fbi clone` only works on termial with `git`、 `rm -rf`、 `mkdir` commands，if using `windows`，you should use `git bash`.

* See available tasks & templates
```bash
$ fbi ls
```

* Create project and run
```bash
$ cd path/to/empty/folder
$ fbi init template1
$ fbi i
$ fbi [task]
```

* update fbi-data
```bash
$ fbi pull
```

### Q&A
* How does FBI to identify task?
  1. in `fbi/config.js` => `paths.tasks` folder (default `./fbi`)
  1. `.js` file
  1. Does not contain `config` characters

* How does FBI to identify template?
  1. `fbi/config.js` => `template`

* What's the order does FBI find a task?
  1. local => `./fbi/`
  1. is template ? => global template tasks
  1. global => global tasks

