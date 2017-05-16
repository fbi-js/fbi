<div align="center">
  <h2 style="color:#48abd6;font-weight:600;">F B I</h2>
  <p>Front-end & Back-end(node.js) development Intelligent</p>
</div>

FBI is an open source command line tool. Use it to create developer-friendly workflow, making it easier to build, deploy and manage projects.

[中文版说明](./README_zh-cn.md)




## Features

1. **Task Management** -  Manage normal js files as global tasks.
2. **Template Management** - Reuse projects as global templates.
3. **Development dependent Management** - Host devDependencies away from project's folder.
4. **Workflow** - Design your own workflow via FBI.
4. **Lightweight** - No dependencies.



## Install

```bash
$ npm i -g fbi
```
> Requirement: node v6.9.1+, npm v3.10+




## Usage

```bash
$ fbi -h 			# show usage
```





## Quick Start



### Task

Get started with FBI task in three easy steps.

1. Create a task
2. Add task to FBI
3. Run task everywhere

#### Step 1. Create a task

```js
// File: ./task-demo/fbi/showtime.js
console.log(new Date())
```

#### Step 2. Add task to FBI

```
$ cd path/to/task-demo/
$ fbi ata   	# short for 'fbi add-task'
```

#### Step 3. Run task everywhere

```bash
$ fbi showtime

# output:
# FBI => Running local task "showtime"...
# 2017-05-16T05:04:18.151Z
```

[see full example](https://github.com/neikvon/fbi-tasks-demo)

`fbi` will add the `.js` files in `./fbi` folder to fbi's global tasks folder.




### Template

Get started with FBI template in five easy steps.

1. Create a template
2. Install dependencies
3. Test
2. Add template to FBI
3. Use template everywhere

#### Step 1. Create a template

Template structure:

```bash
|-- fullpack
|--|-- src
|--|--|-- index.html
|--|--|-- css/
|--|--|-- js/
|--|--|-- img/
|--|-- fbi
|--|--|-- config.js
|--|--|-- build.js
|--|-- package.json
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

#### Step 2. Install dependencies

```bash
$ npm i
```

#### Step 3. Test

```bash
$ fbi b
```


#### Step 4. Add template to FBI

```
$ fbi atm             	# The 'template' field in 'config.js' will be the template name
```

#### Step 5. Use template everywhere

```bash
$ fbi ls 				# List all tasks and templates
$ fbi init fullpack 	# Init template 'fullpack' in current folder
$ fbi b 				# Run 'build' task in current template
```

[see full example](https://github.com/neikvon/fbi-template-webpack2)




### Teamwork


Get started with FBI teamwork in three easy steps.

1. Create a git repository of tasks and templates
2. Clone to local
3. Use common tasks and templates


#### Step 1. Create a git repository of tasks and templates

Repository structure：

```bash
|--fbi-data
|--|-- tasks
|--|--|-- fbi
|--|--|--|-- task1.js
|--|--|--|-- task2.js
|--|--|--|-- ...
|--|--|-- package.json
|--|--|-- node_modules
|--|-- templates
|--|--|-- template1
|--|--|--|-- fbi
|--|--|--|--|-- config.js
|--|--|--|--|-- task1.js
|--|--|--|--|-- task2.js
|--|--|--|-- src
|--|--|--|-- package.json
|--|--|--|-- node_modules
|--|--|--|--|--README.md
|--|--|-- template2
|--|--|--|-- ...
|--|--|-- ...
```

#### Step 2. Clone to local

```bash
$ fbi clone git@path/to/remote/fbi-data.git
```

Tips: `fbi clone` only works on termial with `git`、 `rm -rf`、 `mkdir` commands, if using `windows`，you should use `git bash`.


#### Step 3. Use common tasks and templates

* See available tasks & templates

```bash
$ fbi ls
```

* Create project and run

```bash
$ cd path/to/empty/folder
$ fbi init template1     # Init a new project via template1
$ fbi i                  # Install dependencies

$ fbi task1              # Run a local preference task
$ fbi task1 -g           # Run a global task
$ fbi task1 -t           # Run a template task
```

* Update fbi-data

```bash
$ fbi pull
```



### Examples
1. [tasks-demo](https://github.com/neikvon/fbi-tasks-demo)
1. [template-fullpack](https://github.com/neikvon/fbi-template-fullpack)
1. [template-vue](https://github.com/neikvon/fbi-template-vue)
1. [template-vue-components](https://github.com/neikvon/fbi-template-vue-components)
1. [template-mod](https://github.com/neikvon/fbi-template-mod)
1. [template-webpack1](https://github.com/neikvon/fbi-template-webpack1) ( Compatible with fbi v1.x )



### [Change log](https://github.com/neikvon/fbi/blob/master/CHANGELOG.md)