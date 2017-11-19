const exec = require('./exec')

/**
 * Whether it is a git repository
 *
 * @param {string} cwd current working directory
 * @returns
 */
async function is(cwd) {
  try {
    if (cwd) {
      const cmd = 'git rev-parse --git-dir'
      const ret = await exec(cmd, {
        cwd
      })
      return ret
    }
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
function clone(url, cwd = '.', name = '', showInfo, logger) {
  const cmd = `git clone ${url} ${name}`
  return exec(
    cmd,
    {
      cwd,
      stdio: showInfo ? 'inherit' : 'ignore'
    },
    logger
  )
}

/**
 * `git pull`
 *
 * @param {string} cwd current working  directory
 */
async function pull(cwd, showInfo) {
  try {
    await reset(cwd, showInfo)
    const cmd = 'git pull'
    await exec(cmd, {
      cwd
    })
  } catch (err) {
    throw err
  }
}

/**
 * Get git tags
 *
 * @param {string} cwd current working  directory
 * @param {number} [lines=10] lines to show
 * @returns
 */
function tags(cwd, logger) {
  const cmd = `git tag`
  return exec(
    cmd,
    {
      cwd
    },
    logger
  )
}

/**
 * Get git tags
 *
 * @param {string} cwd current working  directory
 * @param {number} [lines=10] lines to show
 * @returns
 */
function tagsWithComments(cwd, lines = 10) {
  // Example: git tag -n100
  const cmd = `git tag -n${lines}`
  return exec(cmd, {
    cwd
  })
}

async function currentTag(cwd, logger) {
  try {
    const cmd = 'git describe --tags'
    return await exec(cmd, {cwd}, logger)
  } catch (err) {
    throw err
  }
}

async function currentBranch(cwd) {
  try {
    const cmd = 'git rev-parse --abbrev-ref HEAD'
    return exec(cmd, {cwd})
  } catch (err) {
    throw err
  }
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
async function checkout(cwd, version = 'master', showlog = false, logger) {
  try {
    await reset(cwd, showlog, logger)

    const {branchs, current} = await getBranchs(cwd, logger)

    if (current && current === 'v' + version) {
      return false
    }

    let cmd
    const branchName = version === 'master' ? version : `v${version}`
    if (branchs.includes(branchName)) {
      cmd = `git checkout ${branchName}`
    } else {
      cmd = `git checkout -b ${branchName} ${version}`
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
  } catch (err) {
    throw err
  }
}

async function getBranchs(cwd, logger) {
  try {
    const cmd = 'git branch'
    const str = await exec(
      cmd,
      {
        cwd
      },
      logger
    )
    let current
    branchs = str.split('\n').map(b => {
      const ret = b.replace('*', '').trim()
      if (b.includes('*')) {
        current = ret
      }
      return ret
    })

    return {
      branchs,
      current
    }
  } catch (err) {
    throw err
  }
}

async function reset(cwd, showlog = false, logger) {
  try {
    const reset = 'git reset --hard HEAD'
    const clean = 'git clean -f -d'
    const opts = {cwd}
    await exec(reset, opts, logger)
    await exec(clean, opts, logger)
  } catch (err) {
    console.log(err)
    throw err
  }
}

module.exports = {
  is,
  clone,
  pull,
  tags,
  currentTag,
  currentBranch,
  checkout,
  getBranchs
}
