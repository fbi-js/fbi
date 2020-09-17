<p align="center">
  <a href="https://fbi-js.github.io/docs/" target="_blank" rel="noopener noreferrer"><img width="100" src="./assets/logo.png" alt="fbi logo"></a>
</p>

fbi 是一个基于MIT协议开源的命令行工作流工具。

## 安装

FBI 需安装在全局，以便在任意目录可开始你的工作流。

```bash
$ npm i -g fbi
# OR
$ yarn global add fbi
# OR
$ pnpm i -g fbi
```

## 快速开始

### 一、基于远程仓库添加 fbi 模板

```bash
$ fbi add <repositories...>
```

> 查看更多官方模板：[官方模板列表](/pages/4x/more.md)

### 二、通过添加的模板创建项目

```bash
$ fbi create [tempalate|factory] [project]

# OR

$ fbi create
# 然后选择需要的模版
```

> 使用 `$ fbi ls` 可以查看已添加和关联的仓库及模板

### 三、运行任务

```bash
$ cd my-project

$ fbi serve
# OR
$ fbi s
```

> `$ fbi ls` 可查看当前目录可用的任务和模板

## License

Licensed under [MIT](https://opensource.org/licenses/MIT).
