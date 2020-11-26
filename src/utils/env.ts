import { execSync } from 'child_process'

export const isWindows = process.platform === 'win32'
export const isMacos = process.platform === 'darwin'
export const isLinux = process.platform === 'linux'
export const hasGit = () => {
  try {
    execSync('git --version', { stdio: 'ignore' })
    return true
  } catch (err) {
    return false
  }
}
export const isGitRepo = (cwd: string = process.cwd()) => {
  try {
    execSync('git rev-parse --git-dir', { cwd, stdio: 'ignore' })
    return true
  } catch (err) {
    return false
  }
}
export const hasNpm = () => {
  try {
    execSync('npm --version', { stdio: 'ignore' })
    return true
  } catch (err) {
    return false
  }
}
export const hasYarn = () => {
  try {
    execSync('yarn --version', { stdio: 'ignore' })
    return true
  } catch (err) {
    return false
  }
}
export const hasPnpm = () => {
  try {
    execSync('pnpm --version', { stdio: 'ignore' })
    return true
  } catch (err) {
    return false
  }
}
export const nodeVersion = process.version
  .replace('v', '')
  .split('.')
  .map((x: any) => x * 1)

export const npmVersion = () => {
  try {
    const version = execSync('npm --version', { encoding: 'utf8' })
    return (
      (version &&
        version
          .trim()
          .replace(/\\\n[ \t]*/g, '')
          .replace(/\\`/g, '`')
          .replace(/\\n/g, '')
          .split('.')
          .map((x: any) => x * 1)) ||
      null
    )
  } catch (err) {
    return null
  }
}
