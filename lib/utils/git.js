const exec = require('./exec')
const type = require('./type')

const s2a = s =>
  (s
    ? s
      .split('\n')
      .map(b => b.replace(/^['"]+|['"]+$/g, '').trim())
      .filter(l => l.trim())
    : null)

/**
 * Whether it is a git repository
 *
 * @param {string} dir  directory
 * @returns
 */
async function is (dir) {
  if (!type.isPath(dir)) {
    return false
  }
  try {
    const cmd = 'git rev-parse --git-dir'
    const ret = await exec(cmd, {
      cwd: dir
    })
    return ret
  } catch (err) {
    return false
  }
}

/**
 * `git clone`
 *
 * @param {string} url repository url
 * @param {any} cwd current working  directory
 * @param {string} [name=''] target directory name
 */
function clone (url, cwd = '.', name = '', showlog, logger) {
  const cmd = `git clone ${url} ${name}`
  return exec(
    cmd,
    {
      cwd,
      stdio: showlog ? 'inherit' : 'ignore'
    },
    logger
  )
}

/**
 * `git pull`
 *
 * @param {string} cwd current working  directory
 */
async function pull (cwd, showlog) {
  await reset(cwd, showlog)
  const cmd = 'git pull --rebase'
  await exec(cmd, {
    cwd,
    stdio: showlog ? 'inherit' : 'ignore'
  })
}

/**
 * Get git tags
 *
 * @param {string} cwd current working  directory
 * @param {object} logger logger object
 * @returns
 */
function tags (cwd, logger) {
  const cmd = `git tag`
  return exec(
    cmd,
    {
      cwd
    },
    logger
  ).then(s2a)
}

/**
 * Get latest tag name
 *
 * @param {string} cwd directory
 * @param {object} logger logger object
 * @returns
 */
async function currentTag (cwd, logger) {
  // Desc: --abbrev=0 => Strip hexadecimal digits
  const cmd = 'git describe --tags --abbrev=0'
  return exec(cmd, { cwd }, logger)
}

/**
 * Checkout tag, branch, commit
 *
 * @param {string} cwd current working  directory
 * @param {string} [version='master']
 * @param {boolean} [showlog=false]
 * @param {any} logger
 * @returns
 */
async function checkout (cwd, version = 'master', showlog = false, logger) {
  const isTag = /\bv?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[\da-z-]+(?:\.[\da-z-]+)*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?\b/gi.test(
    version
  )
  const targetBranchName = isTag ? `b${version}` : version
  const { branchs, current } = await getBranchs(cwd, logger)

  if (current && current === targetBranchName) {
    return false
  }

  // Reset before switch branch
  await reset(cwd, showlog, logger)

  let cmd

  if (branchs.includes(targetBranchName)) {
    // Branch exist
    cmd = `git checkout ${targetBranchName}`
  } else {
    // Branch not exist
    // Check tags
    const allTags = await tags(cwd, logger)
    if (allTags.includes(version)) {
      cmd = `git checkout -b ${targetBranchName} ${version}`
    } else {
      throw new Error(`Version \`${version}\` not found.`)
    }
  }

  await exec(
    cmd,
    {
      cwd,
      stdio: showlog ? 'inherit' : 'ignore'
    },
    logger
  )
  return true
}

async function getBranchs (cwd, logger) {
  // const cmd = 'git branch'
  // const str = await exec(
  //   cmd,
  //   {
  //     cwd
  //   },
  //   logger
  // )
  // let current
  // const branchs = str.split('\n').map(b => {
  //   const ret = b.replace('*', '').trim()
  //   if (b.includes('*')) {
  //     current = ret
  //   }
  //   return ret
  // })

  const locals = await localBranches(cwd, logger)
  const remotes = await remoteBranches(cwd, logger)
  const branchs = Array.from(new Set([...locals, ...remotes]))

  return {
    branchs,
    current: await currentBranch(cwd, logger)
  }
}

async function currentBranch (cwd, logger) {
  return exec(
    'git rev-parse --abbrev-ref HEAD',
    {
      stdio: 'pipe',
      cwd
    },
    logger
  )
}

async function localBranches (cwd, logger) {
  return exec(
    'git branch -vv --format="%(refname:short)"',
    {
      cwd
    },
    logger
  ).then(s2a)
}

async function remoteBranches (cwd, logger) {
  return exec(
    'git branch -vvr --format="%(refname:lstrip=3)"',
    {
      cwd
    },
    logger
  ).then(s2a)
}

async function reset (cwd, showlog = false, logger) {
  const reset = 'git reset --hard HEAD'
  const clean = 'git clean -f -d'
  const opts = { cwd }
  await exec(reset, opts, logger)
  await exec(clean, opts, logger)
}

module.exports = {
  is,
  clone,
  pull,
  tags,
  currentTag,
  currentBranch,
  remoteBranches,
  localBranches,
  checkout,
  getBranchs,
  reset
}
