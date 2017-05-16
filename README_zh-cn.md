<div align="center">
  <h2 style="color:#48abd6;font-weight:600;">F B I</h2>
  <p>前端 & 后端(node.js) 开发智能化</p>
</div>

FBI是一个开源命令行工具。使用FBI可创建对开发者友好的工作流，让构建、部署和项目管理变得更容易。

[English Version](./README.md)




## 特性

1. **任务管理** -  将普通js文件变成全局可执行的任务。
2. **模版管理** - 将项目复用为全局模版。
3. **开发依赖管理** - 将开发依赖从项目结构中抽离，只需关心生产依赖。
4. **工作流** - 通过FBI可设计自己的工作流。
4. **轻量** - 无第三方依赖.



## 安装

```bash
$ npm i -g fbi
```
> 要求: node v6.9.1+, npm v3.10+




## 使用

```bash
$ fbi -h 			# 显示帮助
```





## 快速开始



### 任务

使用FBI任务简单三步骤：

1. 创建一个任务
2. 添加到FBI
3. 在任意目录运行任务

#### 第一步. 创建一个任务

```js
// 文件: ./task-demo/fbi/showtime.js
console.log(new Date())
```

#### 第二步. 添加到FBI

```
$ cd path/to/task-demo/
$ fbi ata   	# 'fbi add-task' 的简写
```

#### 第三步. 在任意目录运行任务

```bash
$ fbi showtime

# 输出:
# FBI => Running local task "showtime"...
# 2017-05-16T05:04:18.151Z
```

[完整示例](https://github.com/neikvon/fbi-tasks-demo)

`fbi` 会把 `./fbi` 文件夹内的 `.js` 文件添加到FBI全局任务目录.



### 模版

使用FBI模版五个步骤：

1. 创建模版
2. 安装依赖
3. 测试
2. 添加模版到FBI
3. 在任意目录使用模版

#### 第一步. 创建模版

模版结构:

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
  template: 'webpack-demo', // 必需, 模版名称
  templateDescription: 'template description',
  alias: {
    b: 'build' // 任务名称alias
  }
}
```
```js
// build.js
/**
 * 全局变量:
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

#### 第二步. 安装依赖

```bash
$ npm i
```

#### 第三步. 测试

```bash
$ fbi b
```


#### 第四步. 添加模版到FBI

```
$ fbi atm             	# 'config.js' 里的 'template' 字段即为模版名称
```

#### 第五步. 在任意目录使用模版

```bash
$ fbi ls 				# 显示所有可用的任务和模版
$ fbi init fullpack 	# 在当前目录初始化 'fullpack' 模版
$ fbi b 				# 在当前项目运行 'build' 任务
```

[完整示例](https://github.com/neikvon/fbi-template-webpack2)




### 团队协作


使用FBI协作开发简单三步骤：

1. 创建一个任务和模版的公共git仓库
2. 克隆仓库到本地
3. 使用公共模版和任务


#### 第一步. 创建一个任务和模版的公共git仓库

仓库结构：

```bash
|--fbi-data
|--|-- tasks 				# 全局任务
|--|--|-- fbi
|--|--|--|-- task1.js
|--|--|--|-- task2.js
|--|--|--|-- ...
|--|--|-- package.json
|--|--|-- node_modules
|--|-- templates 			# 全局模版
|--|--|-- template1
|--|--|--|-- fbi
|--|--|--|--|-- config.js 	# 模版配置
|--|--|--|--|-- task1.js 	# 模版任务
|--|--|--|--|-- task2.js
|--|--|--|-- src 			# 模版源码
|--|--|--|-- package.json
|--|--|--|-- node_modules
|--|--|--|--|--README.md
|--|--|-- template2
|--|--|--|-- ...
|--|--|-- ...
```

#### 第二步. 克隆仓库到本地

```bash
$ fbi clone git@path/to/remote/fbi-data.git
```

提示：`fbi clone` 任务需要在支持 `git`、 `rm -rf`、 `mkdir` 的终端执行，如果你是windows用户，可以使用`git bash`。




#### 第三步. 使用公共模版和任务

* 查看可用任务和模版

```bash
$ fbi ls
```

* 初始化项目并执行

```bash
$ cd path/to/empty/folder 	# 定位到新的项目目录
$ fbi init template1     	# 基于 template1 模版初始化一个项目
$ fbi i                  	# 安装依赖（开发依赖和生产依赖会分开安装在不同的目录）

$ fbi task1              	# 运行一个本地优先的任务
$ fbi task1 -g           	# 运行一个全局任务
$ fbi task1 -t           	# 运行一个模版任务
```


* 更新公共任务和模版库

```bash
$ fbi pull
```



### 示例
1. [tasks-demo](https://github.com/neikvon/fbi-tasks-demo)
1. [template-fullpack](https://github.com/neikvon/fbi-template-fullpack)
1. [template-vue](https://github.com/neikvon/fbi-template-vue)
1. [template-vue-components](https://github.com/neikvon/fbi-template-vue-components)
1. [template-mod](https://github.com/neikvon/fbi-template-mod)
1. [template-webpack1](https://github.com/neikvon/fbi-template-webpack1) ( Compatible with fbi v1.x )



### [变更日志](https://github.com/neikvon/fbi/blob/master/CHANGELOG.md)