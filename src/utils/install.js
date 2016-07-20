import cp from 'child_process'

const spawn = cp.spawn

export default (ctx, mod) => {
  const cmd = 'tnpm i -D ' + mod

  ctx.log(`tring '${cmd}'...`)

  // var child = exec(cmd, {
  //   stdio: [0, 1, 2] // 设置子进程 log颜色
  // })

  // child.stdout.on('data', data => {
  //   ctx.log(data)
  // })

  // child.stderr.on('data', data => {
  //   ctx.log(data)
  // })

  // child.on('close', code => {
  //   if (code === 0) {
  //     ctx.log('installtion successful.', )
  //   } else {
  //     ctx.log(`closed with code ${code}`)
  //   }
  // })



  const ls = spawn('tnpm', ['i', '--save-dev'], {
    cwd: process.cwd(),
    stdio: [0, 1, 2] // 设置子进程 log颜色
  })

  ls.stdout.on('data', (data) => {
    console.log(`${data}`)
  })

  ls.stderr.on('data', (data) => {
    console.log(`${data}`)
  })

  ls.on('close', (code) => {
    console.log(`child process exited with code ${code}`)
  })

}