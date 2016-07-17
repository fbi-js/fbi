import fbi from './index'

export default async (cmds) => {
  // console.log(cmds)
  if (cmds.length === 0) {
    fbi.help()
    return
  }

  let stop = false
  for (let cmd of cmds) {
    if (stop) {
      continue
    }
    switch (cmd) {
      case 'n':
      case 'new':
        await fbi.new()
        break
      case 's':
      case 'serve':
        await fbi.serve()
        break
      case 'w':
      case 'watch':
        fbi.watch()
        break
      case '-v':
      case '-V':
      case '--version':
        stop = true
        fbi.version()
        break
      case '-h':
      case '--help':
        stop = true
        fbi.help()
        break
      default:
        fbi.run()
        break
    }
  }
}
