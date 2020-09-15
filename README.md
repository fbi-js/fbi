# fbi v4

> 功能完善中...

## 安装

FBI 需安装在全局，以便在任意目录可开始你的工作流。

```shell
$ npm i -g fbi@next
# OR
$ yarn global add fbi@next
# OR
$ pnpm i -g fbi@next
```

## 快速开始

### 一、基于远程仓库添加 fbi 模板

```
$ fbi add <repositories...>
```

> 查看更多官方模板：[官方模板列表](/pages/4x/more.md)

### 二、通过添加的模板创建项目

```bash
$ fbi create <tempalate|factory> [project]
```

> 使用 `$ fbi ls` 可以查看已添加和关联的仓库及模板

### 三、运行任务

```shell
$ cd my-project

$ fbi serve
# OR
$ fbi s
```

> `$ fbi ls` 可查看当前目录可用的任务和模板
