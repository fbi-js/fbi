const path = require('path')
const spawn = require('child_process').spawn
const repo = ctx.argvs[1]

if (!repo || path.extname(repo) !== '.git') {
  ctx.log('Usage: fbi clone path/to/git/repo.git', 0)
  return
}

const target = ctx.options.data.root

if (target) {
  clear()
}

function clear() {
  const cmd = spawn('rm', ['-rf', target], {
    stdio: [0, 1, 2] // child_process log style
  })

  cmd.on('close', status => {
    if (status === 0) {
      mkdir()
    } else {
      ctx.log(`Error with status ${status}.`)
    }
  })
}

function mkdir() {
  const cmd = spawn('mkdir', [target], {
    stdio: [0, 1, 2] // child_process log style
  })

  cmd.on('close', status => {
    if (status === 0) {
      clone()
    } else {
      ctx.log(`Error with status ${status}.`)
    }
  })
}

function clone() {
  const cmd = spawn('git', ['clone', ctx.argvs[1], '.'], {
    cwd: target,
    stdio: [0, 1, 2] // child_process log style
  })

  cmd.on('close', status => {
    if (status === 0) {
      ctx.log(`fbi data cloned successfully.`, 1)
    } else {
      ctx.log(`Error with status ${status}.`)
    }
  })
}