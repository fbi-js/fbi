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

fbi is an open source workflow tool. It was designed to help developers improve productivity, unify and standardize teams workflows.

[中文 README](./README_zh.md)

## Features

- **templates management**: create and build projects quickly and easily. (Version 3.0 supports git-based version control)
- **tasks management**: manage recurring processes easily. Just need to write the recurring processes into js file, and add it to fbi global.
- **dependencies management**: You can choose to let fbi to manage development dependencies, and shared between multiple projects, make the project directory more concise.
- **high scalability**: It's easy to create a workflow that suits your habits via fbi.

## Quick start

```bash
# Install globally
$ npm i -g fbi

# Add one or more project templates
$ fbi add https://github.com/fbi-templates/fbi-project-vue.git ...

# Initialize a project
$ cd path/to/workspace
$ fbi init vue my-project -o

# Start the development server
$ cd my-project
$ fbi s
```

## Resources

- [Full documentation](https://neikvon.gitbooks.io/fbi/content/)
- [Official templates](https://github.com/fbi-templates)
- [Migrate a fbi 2.x project to 3.0](https://github.com/fbi-templates/fbi-task-migrate)

## Changelog

- [CHANGELOG.md](./CHANGELOG.md)
- [release notes](https://github.com/AlloyTeam/fbi/releases)

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2015-present, neikvon@[AlloyTeam](https://github.com/AlloyTeam)
