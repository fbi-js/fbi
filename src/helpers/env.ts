import { isWindows, isMacos, isLinux, hasGit, hasNpm, hasYarn, hasPnpm, npmVersion } from '../utils'

export function getEnv() {
  return {
    isWindows,
    isMacos,
    isLinux,
    hasGit: hasGit(),
    hasNpm: hasNpm(),
    hasYarn: hasYarn(),
    hasPnpm: hasPnpm(),
    usingNvm: process.env.NVM_DIR && process.execPath.includes(process.env.NVM_DIR),
    home: (process.platform === 'win32' && process.env.USERPROFILE) || process.env.HOME || '/',
    tmp: process.env.TMPDIR,
    pwd: process.env.PWD,
    oldPwd: process.env.OLDPWD,
    user: process.env.USER,
    shell: process.env.SHELL,
    zsh: process.env.ZSH,
    term: process.env.TERM_PROGRAM,
    termVersion: process.env.TERM_PROGRAM_VERSION,
    fbiVersion: require('../../package.json').version,
    npmVersion: npmVersion()
  }
}

export function changeTitle(title: string) {
  process.title = title
}
