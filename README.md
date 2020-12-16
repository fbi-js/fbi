<p align="center">
  <a href="https://fbi-js.github.io/docs/" target="_blank" rel="noopener noreferrer"><img width="100" src="./assets/logo.png" alt="fbi logo"></a>
</p>

fbi is an workflow tool in command-line. It was designed to help developers improve productivity, unify and standardize teams workflows.

## Usage

### Scene 1

```bash
# create project
npx fbi create [factory]

# see available commands and templates
npx fbi ls
```

### Scene 2

```bash
# install globally
npm i -g fbi

# add factory
fbi add [factory]

# create project
fbi create

# see available commands and templates
fbi ls
```

## BuiltIn Commands

- `fbi -h`: Display help for `fbi`
- `fbi <command> -h`: Display help for `<command>`

### `Add`

```bash
Usage: fbi add [options] <factories...>

add factories from npm module or git url

Options:
  -y, --yes                     Yes to all questions
  -t, --target-dir <dir>        Target dir for factory from npm
  -p, --package-manager <name>  Specifying a package manager. e.g. pnpm/yarn/npm
  -d, --debug                   output extra debugging
  -h, --help                    display help for command

Examples:
  fbi add factory-node
  fbi add @fbi-js/factory-node -t sub-dir -y
```

## `Remove`

```bash
Usage: fbi remove [options] [factoryIds...]

remove factories from the store. Also delete files.

Options:
  -d, --debug  output extra debugging
  -h, --help   display help for command

Examples:
  fbi remove
  fbi remove @fbi-js/factory-node
```

### `Create`

```bash
Usage: fbi create [options] [template|factory] [project]

create a project via template or factory. If factory non-exist, it will install the factory first.

Options:
  -p, --package-manager <name>  Specifying a package manager. e.g. pnpm/yarn/npm (default: "npm")
  -d, --debug                   output extra debugging
  -h, --help                    display help for command

Examples:
  fbi create factory-node
  fbi create factory-node my-app -p yarn
```

### `List`

```bash
Usage: fbi list|ls [options] [factories...]

list factories and commands info

Options:
  -a, --all       show all factories
  -p, --projects  show projects
  -d, --debug     output extra debugging
  -h, --help      display help for command

Examples:
  fbi ls
  fbi ls @fbi-js/factory-node -p
```

### `Link`

```bash
Usage: fbi link [options] [factories...]

link local factories to the store. Usful for factory development.

Options:
  -d, --debug  output extra debugging
  -h, --help   display help for command

Examples:
  fbi link
  fbi link local-folder
```

### `Info`

```bash
Usage: fbi info [options]

get environment info, get/set context config

Options:
  -e, --edit   Edit config
  -d, --debug  output extra debugging
  -h, --help   display help for command

Examples:
  fbi info
  fbi info -e
```

### `Clean`

```bash
Usage: fbi clean [options]

clean stale factories and projects

Options:
  -d, --debug  output extra debugging
  -h, --help   display help for command

Examples:
  fbi clean
```

## Factory

Factory produces project templates and commands.

[Official factories](https://github.com/fbi-js?q=factory-)

## Contribution

Please make sure to read the [Contributing Guide](./CONTRIBUTING.md) before making a pull request.

Thank you to all the people who already contributed to fbi!

## License

Licensed under [MIT](https://opensource.org/licenses/MIT).
