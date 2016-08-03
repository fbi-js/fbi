<div align="center">
  <h3 style="color:#48abd6;font-weight:600;">F B I</h3>
  <p style="font-size:16px;">Node.js workflow tool</p>
</div>

[中文版](./README_zh-cn.md)

### Features

* Tasks Management -  manage your js files as global tasks
* Templates Management - reuse projects as global templates
* node_modules Management - host devDependencies away from project's folder, and, it's faster
* Lightweight
* No dependency

### Installation

```bash
$ npm i -g fbi
```


### Usage

```bash
$ fbi [task]              # run a local preference task
$ fbi [task] -g           # run a global task
$ fbi [task] -t           # run a template task
```

```bash
$ fbi ata,   add-task [*, name.js]    # add task files in current folder
$ fbi atm,   add-tmpl [name]          # add current folder as a template named [name]
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

### Quick Start

#### Add task


```js
// showtime.js

console.log(new Date())
```
```bash
$ cd path/to/showtime.js

$ fbi ata showtime.js   # short for 'fbi add-task showtime.js'
```
```bash
$ fbi showtime

# output:
# FBI => Running global task "showtime"...
# 2016-08-03T09:06:28.349Z
```
you can write a task as normal node.js program, if required npm modules, after ```fbi ata [name].js```, you should ```fbi i``` to install dependencies, dependencies will be installed in the global tasks folder.

#### Add template

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

```bash
$ fbi atm
# or
$ fbi atm [new-name]
```
```bash
$ fbi ls              # see available Tasks & Templates
```

### Q&A
* How does FBI to identify task?
  1. fbi/config.js => paths.tasks
  1. '.js' file
  1. Does not contain 'config' characters

* How does FBI to identify template?
  1. fbi/config.js => template
