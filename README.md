# fbi v4

> work in progress...

## Install

```bash
$ npm i -g fbi@next
# OR
$ yarn global add fbi@next
# OR
$ pnpm i -g fbi@next
```

## Configure

```bash
$ fbi-next add [repositories]
```

## Usage

### Create a new project

```bash
$ fbi-next create [tempalate name]
```

## peoject constructure

<pre>
.
├── README.md
├── bin 启动文件夹
│ ├── run 启动命令入口
│ └── run.cmd
├── package.json
├── src 主要编写文件夹
│ ├── cli.ts _入口文件_
│ ├── commands _命令文件夹_
│ │ ├── add.ts  add命令
│ │ ├── clean.ts clean命令
│ │ ├── create.ts create命令
│ │ ├── info.ts info命令
│ │ ├── link.ts link命令
│ │ ├── list.ts list命令
│ │ ├── remove.ts remove命令
│ │ └── unlink.ts unlink命令
│ ├── core _基础组件_
│ │ ├── base.ts 所有组件的基类
│ │ ├── command.ts 所有commands组件的基类
│ │ ├── factory.ts factory基类
│ │ ├── plugin.ts 所有plugins组件的基类
│ │ ├── store.ts 仓库类
│ │ ├── template.ts
│ │ └── version.ts
│ ├── fbi.ts _fbi 文件_
│ ├── helpers _基础变量处理_
│ │ ├── config.ts 配置文件
│ │ ├── env.ts 环境变量文件
│ │ └── index.ts
│ ├── index.ts
│ ├── plugins _plugin文件夹_
│ │ └── logger.ts 日志类
│ └── utils _公用工具_
│ ├── env.ts 与环境有关的公共判断方法
│ ├── format.ts 数据格式化公共方法
│ ├── git.ts git相关操作封装
│ ├── index.ts
│ ├── object.ts object相关公共处理方法
│ ├── type.ts 类型判断公共方法
│ └── version.ts 版本号处理相关方法
├── tsconfig.json
</pre>

## 插件说明

- ora 一个优雅的 Node.js 终端加载动画效果
- mocha 是一个功能丰富的 javascript 测试框架，运行在 node.js 和浏览器中，使异步测试变得简单有趣。Mocha 测试连续运行，允许灵活和准确的报告，同时将未捕获的异常映射到正确的测试用例。在 Github 上托管。
- commander 命令行参数处理工具
- semver 版本号对比库
