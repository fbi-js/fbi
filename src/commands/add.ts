import { join } from 'path'
import { Fbi } from '../fbi'
import { Command } from '../core/command'
import { git, isGitUrl } from '../utils'

export default class CommandAdd extends Command {
  id = 'add'
  alias = ''
  args = '<repositories...>'
  description = `add factories from remote git repositories`
  flags = [['-p, --package-manager <name>', 'Specifying a package manager. e.g. pnpm/yarn/npm']]

  constructor(public factory: Fbi) {
    super()
  }

  public async run(repositories: any, flags: any) {
    const config = this.context.get('config')
    const rootDir = join(config.rootDirectory, config.directoryName)

    for (const repo of repositories) {
      const info = this.getBaseInfo(repo, config)
      if (!info) {
        continue
      }
      const targetDir = join(rootDir, info.name)
      // 添加的仓库是否已存在
      const exist = await this.fs.pathExists(targetDir)
      if (exist) {
        // 若已存在则更新模板
        await this.update(targetDir, info.name)
      } else {
        const valid = await this.checkGitUrl(info.url)
        if (!valid) {
          continue
        }
        this.debug(`git clone ${info.url} ${targetDir}`)
        await this.add(info.name, info.url, targetDir)
      }

      // save to store
      const data = {
        id: info.name,
        type: 'git',
        from: info.url,
        path: targetDir,
        updatedAt: Date.now()
      }
      this.debug('Save to store:', data)
      this.store.set(data.id, data)

      await this.install(flags || {}, targetDir)

      const { version, global } = await this.getVersionInfo(targetDir)
      if (version) {
        this.store.set(`${info.name}.version`, version)
      }
      if (global) {
        this.store.set(`${info.name}.global`, global)
      }
    }
  }

  private getBaseInfo(url: string, { organization }: any) {
    let gitUrl = ''
    if (isGitUrl(url)) {
      gitUrl = url
    } else {
      const repoReplaced = url.replace(/(^\/*)|(\/*$)/g, '')
      if (repoReplaced.split('/').length > 1) {
        gitUrl = `https://github.com/${repoReplaced}`
      } else {
        gitUrl = `${organization}/${repoReplaced}`
      }
    }

    gitUrl = gitUrl.endsWith('.git') ? gitUrl : `${gitUrl}.git`
    const name = gitUrl.split('/').pop()?.replace('.git', '')
    if (!name) {
      this.error(`invalid url:`, gitUrl)
      return null
    }

    return {
      name,
      url: gitUrl
    }
  }

  private async checkGitUrl(url: string) {
    const spinner = this.createSpinner(`Checking remote url '${url}'`).start()
    const remoteExist = await git.remoteExist(url)
    if (!remoteExist) {
      spinner.fail(`Remote path not exist: ${url}`)
      return false
    }
    spinner.succeed(`Valid: ${url}`)
    return true
  }

  private async add(name: string, src: string, dest: string) {
    const _name = this.style.cyan(name)
    const spinner = this.createSpinner(`Adding ${_name} from '${src}'`).start()
    try {
      await git.clone(`${src} ${dest}`)
      spinner.succeed(`Added ${_name}`)
    } catch (err) {
      spinner.fail(`Failed to add ${name}`)
      this.error(err)
    }
  }

  private async update(targetDir: string, name: string) {
    const spinner = this.createSpinner(`Already exist: ${name}. Try updating...`).start()
    await git.hardReset('', {
      cwd: targetDir
    })
    await git.pull('', {
      cwd: targetDir
    })
    spinner.succeed(`Updated`)
  }

  private async install(flags: Record<string, any>, targetDir: string) {
    const spinner = this.createSpinner(`Installing dependencies...`).start()
    try {
      const packageManager = flags.packageManager || this.context.get('config').packageManager
      const cmds = packageManager === 'yarn' ? [packageManager] : [packageManager, 'install']
      this.debug(`\nrunning \`${cmds.join(' ')}\` in ${targetDir}`)
      await this.exec(cmds[0], cmds.slice(1), {
        cwd: targetDir
      })
      spinner.succeed(`Installed dependencies`)
    } catch (err) {
      spinner.fail('Failed to install dependencies. You can install them manually.')
      this.error(err)
    }
  }

  private async getVersionInfo(dir: string) {
    const factory = this.factory.createFactory(dir)
    if (!factory) {
      return {}
    }
    const config = this.context.get('config')
    const factoriesDir = join(config.rootDirectory, config.directoryName)
    const versionInfo = await factory.version?.init(factoriesDir)

    return {
      version: {
        baseDir: factoriesDir,
        ...versionInfo
      },
      global: factory.isGlobal
    }
  }
}
