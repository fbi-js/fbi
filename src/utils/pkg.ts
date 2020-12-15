import execa from 'execa'

export const remotePkgVersion = async (name: string) => {
  try {
    const { stdout } = await execa.command(`npm view ${name} version`)
    return stdout
  } catch (err) {
    return ''
  }
}
