import execa from 'execa'
import { isValidArray } from './type'

type Argv = string | number

const exec = async (str: string, opts: Record<string, any> = {}) => {
  const cmd = str.split(' ').filter(Boolean).join(' ')
  try {
    const { stdout } = await execa.command(cmd, opts)
    return stdout
  } catch (err) {
    throw err
  }
}

const pathOrAll = (arr: any) => (isValidArray(arr) ? arr.join(' ') : '.')
// string to array
const s2a = (stdout: any): string[] | PromiseLike<string[]> =>
  stdout
    .trim()
    .split('\n')
    // eslint-disable-next-line no-useless-escape
    .map((b: string) => b.replace(/^[\'\"]+|[\'\"]+$/g, '').trim())
    .filter((l: string) => l.trim())

const root = (opts?: object) => exec('git rev-parse --show-toplevel', opts).catch(() => null)
const init = (opts?: object) => exec('git init', opts)
const fetch = (argv: Argv, opts?: object) => exec(`git fetch ${argv}`, opts)
const clone = (argv: Argv, opts?: object) => exec(`git clone ${argv}`, opts)
const pull = (argv: Argv, opts?: object) => exec(`git pull ${argv}`, opts)
const push = (argv: Argv, opts?: object) =>
  exec(`git push ${argv || ''} --quiet`, {
    ...(opts || {}),
    stdio: 'inherit'
  })
const add = (arr?: any, opts?: object) => exec(`git add ${pathOrAll(arr)}`, opts)
const del = (arr?: any, opts?: object) =>
  isValidArray(arr) ? exec(`git rm ${arr.join(' ')}`, opts) : null
const commit = (arr?: any, m?: any, opts?: object) =>
  exec(`git commit ${pathOrAll(arr)} -m "${m || ''}"`, opts)
const checkout = (arr?: any, opts?: object) =>
  exec(`git checkout ${Array.isArray(arr) ? pathOrAll(arr) : arr} --quiet`, opts)
const merge = (t: Argv, argv?: Argv, opts?: object) => exec(`git merge ${argv} ${t}`, opts)
const clear = (opts?: object) => exec('git gc', opts)
const clean = (opts?: object) => exec('git clean -f -d', opts)
const hardReset = (n?: Argv, opts?: object) => exec(`git reset --hard ${n || 'HEAD'}`, opts)

const status = {
  // info
  untracked: (opts?: object) => exec('git ls-files --others --exclude-standard', opts).then(s2a),
  modified: (opts?: object) => exec('git diff --name-only --diff-filter=M', opts).then(s2a),
  deleted: (opts?: object) => exec('git diff --name-only --diff-filter=D', opts).then(s2a),
  conflicts: (opts?: object) => exec('git diff --name-only --diff-filter=U', opts).then(s2a),
  staged: (opts?: object) => exec('git diff --name-only --cached', opts).then(s2a),
  unpushed: (opts?: object) =>
    exec('git cherry -v', opts)
      .then(s2a)
      .catch(() => false),
  isRebasing: (opts?: object) =>
    exec('git status', opts).then((stdout) => stdout && stdout.includes('rebase in progress')),
  conflictStrings: (opts?: object) => exec('git grep -n "<<<<<<< "', opts).then(s2a),
  conflictFiles: (opts?: object) => exec('git grep --name-only "<<<<<<< "', opts).then(s2a),
  changes: (opts?: object) => exec('git status --porcelain', opts).then(s2a),
  needPull: (opts?: object) => exec('git fetch --dry-run', opts).then((res) => !!res),

  // action
  show: (opts?: object) =>
    exec('git status --short', {
      ...(opts || {}),
      stdio: 'inherit'
    })
}

const stash = {
  // info
  list: (opts?: object) => exec('git stash list', opts).then(s2a),

  // action
  add: (argv: Argv, opts?: object) => exec(`git stash ${argv}`, opts),
  pop: (opts?: object) => exec('git stash pop', opts),
  clear: (opts?: object) => exec('git stash clear', opts)
}

const tag = {
  // info
  list: (opts?: object) => exec('git tag', opts).then(s2a),
  latest: (opts?: object) => exec('git describe --abbrev=0', opts).catch((err) => console.log),

  // action
  add: (n: Argv, opts?: object) => exec(`git tag -a ${n}`, opts),
  del: (n: Argv, opts?: object) => exec(`git tag -d ${n}`, opts),
  checkout: (n: Argv, opts?: object) => exec(`git checkout ${n} --quiet`, opts)
}

const branch = {
  // info
  current: (opts?: object) =>
    exec('git rev-parse --abbrev-ref HEAD', {
      ...(opts || {}),
      stdio: 'pipe'
    }),
  locals: (opts?: object) => exec('git branch -vv --format="%(refname:short)"', opts).then(s2a),
  remotes: (opts?: object) =>
    exec('git branch -vvr --format="%(refname:lstrip=3)"', opts)
      .then(s2a)
      .then((r) => r.filter((n) => n !== 'HEAD')),
  stales: (opts?: object) =>
    exec(
      'git branch -vv --format="%(if:equals=gone)%(upstream:track,nobracket)%(then)%(refname:short)%(end)"',
      opts
    ).then(s2a),
  upstream: (n: Argv, opts?: object) =>
    exec(`git rev-parse --abbrev-ref ${n || 'HEAD'}@{upstream}`, opts).catch(() => false),
  needMerge: (n1: Argv, n2: Argv, opts?: object) => exec(`git rev-list -1 ${n1} --not ${n2}`, opts),

  // action
  add: (n: Argv, from: Argv, opts?: object) =>
    exec(`git checkout -b ${n} ${from || ''} --quiet`, opts),
  del: (n: Argv, force: boolean, opts?: object) =>
    exec(`git branch -${force ? 'D' : 'd'} ${n}`, opts),
  delRemote: (n: Argv, opts?: object) => exec(`git push origin --delete ${n}`, opts),
  checkout: (n: Argv, opts?: object) => exec(`git checkout ${n} --quiet`, opts)
}

const remoteExist = async (argv: Argv, opts?: object) => {
  try {
    await exec(`git ls-remote --exit-code -h ${argv}`, { stdio: 'ignore', ...opts })
    return true
  } catch (err) {
    return false
  }
}

export const git = {
  root,
  init,
  fetch,
  clone,
  pull,
  push,
  add,
  del,
  commit,
  checkout,
  merge,
  clear,
  clean,
  hardReset,
  status,
  stash,
  tag,
  branch,
  remoteExist
}
