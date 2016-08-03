<div align="center">
  <h3 style="color:#48abd6;font-weight:600;">F B I</h3>
  <p style="font-size:16px;">Node.js 工作流工具</p>
</div>

[English Version](./README.md)

### 特性

* 任务托管 - 将js文件托管为全局任务
* 模板托管 - 复用项目模板
* node模块管理 - 从项目目录抽离node\_modules目录, 优化模块查找路径
* 轻量
* 无第三方依赖

### 安装

```bash
$ npm i -g fbi
```


### 使用

```bash
$ fbi [task]              # 运行一个本地优先的任务
$ fbi [task] -g           # 运行一个全局任务
$ fbi [task] -t           # 运行一个模板任务
```

```bash
$ fbi ata,   add-task [*, name.js]    # 添加任务
$ fbi atm,   add-tmpl [name]          # 将当前目录添加为模板
$ fbi rta,   rm-task  [-t] [name]     # 移除任务
$ fbi rtm,   rm-tmpl  [name]          # 移除模板
$ fbi i,     install                  # 安装依赖
$ fbi ls,    list                     # 查看所有可用任务和模板
$ fbi cat    [task]   [-t, -g]        # 查看任务源码
$ fbi init   [template]               # 初始化模板
$ fbi backup                          # 备份任务与模板
$ fbi recover                         # 从当前目录恢复任务与模板

$ fbi -h,    --help                   # 显示帮助
$ fbi -v,    --version                # 显示版本号
```

### 快速开始

#### 添加任务


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
你可以像编写普通node.js程序一样编写任务，如果有依赖第三方模块，在```fbi ata [name].js```添加任务后，还需要```fbi i```安装依赖，依赖将会安装在全局任务目录。

#### 添加模板

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
* FBI 怎么识别任务?
  1. fbi/config.js => paths.tasks  配置项指定的任务目录
  1. '.js' 文件
  1. 文件名不包含 'config' 字符

* FBI 怎么识别模版?
  1. fbi/config.js => template  配置项指定的模版名称
