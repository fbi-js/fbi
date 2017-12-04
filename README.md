<div align="center">
  <h2>fbi</h2>
  <p>Front-end & Back-end(node.js) development Intelligent</p>
</div>

<p align="center">
  <a href="https://travis-ci.org/AlloyTeam/fbi/"><img src="https://img.shields.io/travis/AlloyTeam/fbi/v3.x.svg" alt="Build Status"></a>
  <a href='https://coveralls.io/github/AlloyTeam/fbi?branch=v3.x'><img src='https://coveralls.io/repos/github/AlloyTeam/fbi/badge.svg?branch=v3.x' alt='Coverage Status'></a>
  <a href="https://www.npmjs.com/package/fbi"><img src="https://img.shields.io/npm/dm/fbi.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/fbi"><img src="https://img.shields.io/npm/v/fbi.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/fbi"><img src="https://img.shields.io/npm/l/fbi.svg" alt="License"></a>
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
# install globally
$ npm i -g fbi

$ cd path/to/workspace

# Initialize a project
$ fbi init https://github.com/fbi-templates/fbi-project-vue.git my-project

$ cd my-project

# Start the development server
$ fbi s
```

## Resources
- [Full documentation](https://neikvon.gitbooks.io/fbi/content/)
- [Official templates](https://github.com/fbi-templates)


## Changelog

- [CHANGELOG.md](./CHANGELOG.md)
- [release notes](https://github.com/AlloyTeam/fbi/releases)


## License
[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2015-present, neikvon@[AlloyTeam](https://github.com/AlloyTeam)
