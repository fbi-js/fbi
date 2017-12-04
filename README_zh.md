<div align="center">
  <h2>fbi</h2>
  <p>Front-end & Back-end(node.js) development Intelligent</p>
</div>

<p align="center">
  <a href="https://www.npmjs.com/package/fbi"><img src="https://img.shields.io/npm/v/fbi.svg" alt="NPM version"></a>
  <a href="https://travis-ci.org/AlloyTeam/fbi/"><img src="https://img.shields.io/travis/AlloyTeam/fbi/v3.x.svg" alt="Build Status"></a>
  <a href='https://coveralls.io/github/AlloyTeam/fbi?branch=v3.x'><img src='https://coveralls.io/repos/github/AlloyTeam/fbi/badge.svg?branch=v3.x' alt='Coverage Status'></a>
  <a href='https://david-dm.org/AlloyTeam/fbi/v3.x'><img src='https://img.shields.io/david/AlloyTeam/fbi/v3.x.svg' alt='David deps'></a>
  <a href='http://nodejs.org/download/'><img src='https://img.shields.io/badge/node.js-%3E=_7.6.0-green.svg' alt='node version'></a>
  <a href="https://www.npmjs.com/package/fbi"><img src="https://img.shields.io/npm/dm/fbi.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/fbi"><img src="https://img.shields.io/npm/l/fbi.svg" alt="License"></a>
  <a href="https://github.com/sindresorhus/xo"><img src="https://img.shields.io/badge/code_style-XO-5ed9c7.svg" alt="License"></a>
</p>

fbi是一个开源的的工作流工具。它旨在帮助开发人员提高生产力，统一和标准化团队工作流程。

[README in English](./README.md)

## 特性

- **模板管理**：快速轻松地创建和构建项目。(版本3.0支持基于git的版本控制)
- **任务管理**：轻松管理重复的流程。只需将重复的流程写进js文件里，并添加到fbi全局即可。
- **依赖管理**：您可以选择让fbi管理开发依赖项，并在多个项目之间共享，使项目目录更加简洁。
- **高扩展性**：通过fbi创建适合您习惯的工作流程非常简单。


## 快速开始

```bash
# 全局安装
$ npm i -g fbi

# 切换到工作目录
$ cd path/to/workspace

# 初始化项目
$ fbi init https://github.com/fbi-templates/fbi-project-vue.git my-project

# 切换到项目目录
$ cd my-project

# 启动开发服务器
$ fbi s
```


## 资源

- [完整文档](https://neikvon.gitbooks.io/fbi/content/)
- [官方模板](https://github.com/fbi-templates)


## 变更日志

- [变更日志](./CHANGELOG.md)
- [发布日志](https://github.com/AlloyTeam/fbi/releases)


## 开源许可证

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2015-present, neikvon@[AlloyTeam](https://github.com/AlloyTeam)