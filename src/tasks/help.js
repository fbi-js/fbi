// import

const help = `
  Usage: fbi [command] [command] [command] ...

  Commands:

    n, new            new project
    b, build          build project
    s, serve          serve project or files

  Options:

    -h, --help        output usage information
    -v, --version     output the version number
`

export default (ctx) => {
  console.log(help)
}
