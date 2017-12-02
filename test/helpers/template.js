import path from 'path'
import execa from 'execa'

const fbi = path.join(__dirname, '../../bin/fbi')

async function ensure(name, repo) {
  await execa(fbi, ['rm', name])
  await execa(fbi, ['add', repo])
}

export default {ensure}
