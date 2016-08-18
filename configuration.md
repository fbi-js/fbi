# Configuration

## Default
```js
{
  task_param_prefix: '-', // 识别命令行参数的标识，如：fbi b -p, fbi s -3000 （其中p, 3000为参数）
  paths: {
    tasks: 'fbi/', // 本地任务目录
    config: 'fbi/config.js' // 本地配置文件
  },
  data: { // fbi全局任务、模板存放路径
    root: './data',
    tasks: './data/tasks',
    templates: './data/templates'
  },
  server: { // for `fbi serve`, 静态服务器配置（配合serve.js使用）
    root: './',
    host: 'localhost',
    port: 8888
  },
  npm: { // npm配置，用于`fbi install`
    alias: 'npm', // npm别名
    options: '' // 选项，如：--registry=...
  },
  TEMPLATE_ADD_IGNORE: ['.DS_Store', '.svn', '.git'], // 添加模板时的忽略项
  TEMPLATE_INIT_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist'], // 初始化模板时的忽略项
  BACKUP_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist'], // 数据备份时的忽略项
  RECOVER_IGNORE: ['node_modules', '.DS_Store', '.svn', '.git', 'dst', 'dist'] // 数据恢复时的忽略项
}
```

默认配置均可更改，任何时候都以` paths.config `指定的配置文件优先。

## 本地配置：fbi/config.js
```js
{
  template: 'webpack2', // 模板名称，fbi通过该配置项识别模板
  templateDescription: 'Project template with Webpack 2, Koa 2, Postcss and Babel 6.', // 模板描述, 会出现在 fbi ls
  server: { // 覆写默认配置
    root: 'dst/',
    host: 'localhost',
    port: 9000
  },
  npm: { // 覆写默认配置
    alias: 'npm',
    options: ''
    // options: '--registry=https://registry.npm.taobao.org'
  },
  alias: { // 任务别名，精简命令行输入字符
    b: 'build',
    w: 'watch',
    s: 'serve',
    c: 'clean'
  },
  ...
}
```
本地配置里，你可以添加任意其它配置项（无论默认配置有或没有该项），然后，你可以在任务文件里通过` ctx.options `来获取所有配置项 (不需要`require('./config.js')`) 。

如：` ctx.options.server.root `

## 最精简的本地配置
```js
{
  template: 'webpack2'
}
```

## fbi使用的配置项有
```
task_param_prefix
paths
data
npm
TEMPLATE_ADD_IGNORE
TEMPLATE_INIT_IGNORE
BACKUP_IGNORE
RECOVER_IGNORE
template
templateDescription
alias
```
所以，请不要随意更改fbi使用到的配置项的结构和值类型，否则，会出错。