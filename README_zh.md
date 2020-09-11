<div align="center">
  <h2>fbi</h2>
  <p>Front-end & Back-end(node.js) development Intelligent</p>
</div>

<p align="center">
  <a href="https://www.npmjs.com/package/fbi"><img src="https://img.shields.io/npm/v/fbi.svg" alt="NPM version"></a>
  <a href="https://travis-ci.org/AlloyTeam/fbi/"><img src="https://img.shields.io/travis/AlloyTeam/fbi.svg" alt="Build Status"></a>
  <a href='https://coveralls.io/github/AlloyTeam/fbi?branch=master'><img src='https://coveralls.io/repos/github/AlloyTeam/fbi/badge.svg?branch=master' alt='Coverage Status'></a>
  <a href='https://david-dm.org/AlloyTeam/fbi'><img src='https://img.shields.io/david/AlloyTeam/fbi.svg' alt='David deps'></a>
  <a href='http://nodejs.org/download/'><img src='https://img.shields.io/badge/node.js-%3E=_7.6.0-green.svg' alt='node version'></a>
  <a href="https://www.npmjs.com/package/fbi"><img src="https://img.shields.io/npm/dm/fbi.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/fbi"><img src="https://img.shields.io/npm/l/fbi.svg" alt="License"></a>
  <a href="https://standardjs.com"><img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="JavaScript Style Guide"></a>
</p>

fbi 是一个开源的工作流工具。它旨在帮助开发人员提高生产力，统一和标准化团队工作流程。

[README in English](./README.md)

## 主要特性

- **模板管理**：快速轻松地创建和构建项目。(版本 3.0 支持基于 git 的版本控制)
- **任务管理**：轻松管理重复的流程。只需将重复的流程写进 js 文件里，并添加到 fbi 全局即可。
- **依赖管理**：您可以选择让 fbi 管理开发依赖项，并在多个项目之间共享，使项目目录更加简洁。
- **高扩展性**：通过 fbi 创建适合您习惯的工作流程非常简单。

## 快速开始

```bash
# 全局安装
$ npm i -g fbi

# 添加一个或多个项目模板
$ fbi add https://github.com/fbi-templates/fbi-project-vue.git ...

# 初始化项目
$ cd path/to/workspace
$ fbi init vue my-project -o

# 启动开发服务器
$ cd my-project
$ fbi s
```

## 更多资源

- [完整文档](https://neikvon.gitbooks.io/fbi/content/)
- [官方模板](https://github.com/fbi-templates)
- [从 fbi 2.0 迁移到 3.0](https://github.com/fbi-templates/fbi-task-migrate)

## 变更日志

- [变更日志](./CHANGELOG.md)
- [发布日志](https://github.com/AlloyTeam/fbi/releases)

## 开源许可

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2015-present, neikvon@[AlloyTeam](https://github.com/AlloyTeam)
