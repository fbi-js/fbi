import type { Fbi } from '../fbi'
import type { Factory } from '../core/factory'

import { isAbsolute, join, relative } from 'path'
import { Command } from '../core/command'
import { git, isGitUrl, remotePkgVersion } from '../utils'

export default class CommandAdd extends Command {
  id = 'add'
  alias = ''
  args = '<factories...>'
  description = `add factories from npm module or git url`
  flags = [
    ['-y, --yes', 'Yes to all questions', false],
    ['-t, --target-dir <dir>', 'Target dir for factory from npm', ''],
    ['-p, --package-manager <name>', 'Specifying a package manager. e.g. pnpm/yarn/npm']
  ]
  examples = ['fbi add factory-node', 'fbi add @fbi-js/factory-node -t sub-dir -y']

  constructor(public factory: Fbi) {
    super()
  }

  public async run(names: any, flags: any): Promise<Factory[]> {
    this.debug(`Running command "${this.id}" from factory "${this.factory.id}" with options:`, {
      names,
      flags
    })
    const result: Factory[] = []

    for (const name of names) {
      // 1. try npm module
      let factory = await this.addFromNpm(name, flags)

      if (!factory) {
        // 2. try git repository
        factory = await this.addFromGit(name, flags)
      }

      if (factory) {
        result.push(factory)
      }
    }

    return result
  }

  private getGitUrlInfo(url: string, { organization }: any) {
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
    // include organization name in factory name
    const name = gitUrl.split('/').slice(-2)?.join('/')?.replace('.git', '')

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

  private async addFromNpm(name: string, flags: any): Promise<null | Factory> {
    const cwd = isAbsolute(flags?.targetDir)
      ? flags.targetDir
      : join(process.cwd(), flags?.targetDir ?? '')
    const factoryExist = await this.factoryExist(name, 'npm', cwd)
    this.debug('factoryExist:', factoryExist)

    if (!factoryExist) {
      const remotePkgExist = await remotePkgVersion(name)
      if (!remotePkgExist) {
        return null
      }

      if (!flags.yes) {
        const relativePath = relative(process.cwd(), cwd)

        const anwser = (await this.prompt({
          type: 'confirm',
          name: 'confirm',
          message: `'${name}' will be installed in ${
            relativePath ? `'${relativePath}'` : 'current'
          } directory, continue?`,
          initial: true
        })) as any

        if (!anwser.confirm) {
          this.exit()
          return null
        }
      }

      await this.fs.ensureDir(join(cwd, 'node_modules'))
    }
    const styledName = this.style.cyan(name)
    const spinner = this.createSpinner(
      `${factoryExist ? 'Updating' : 'Installing'} ${styledName}`
    ).start()

    try {
      const cmd = `npm install --no-package-lock ${name}`
      const opts = {
        cwd
      }
      this.debug({ cmd, opts })
      await this.exec.command(cmd, opts)
      spinner.succeed(`${factoryExist ? 'Updated' : 'Installed'} ${styledName}`)
      return this.factory.resolveFromLocal(name, cwd)
    } catch (err) {
      spinner.fail(`Failed to ${factoryExist ? 'update' : 'install'} ${name}`)
      this.error(err)
    }
    return null
  }

  private async addFromGit(name: string, flags: any): Promise<null | Factory> {
    let targetDir
    let isUpdate
    let remoteUrl
    let factoryName = name
    const config = this.context.get('config')

    let found = await this.factoryExist(name, 'git')
    if (found) {
      targetDir = found
      factoryName = name
      isUpdate = true
    } else {
      const info = this.getGitUrlInfo(name, config)
      if (!info) {
        return null
      }

      remoteUrl = info.url
      factoryName = info.name

      if (factoryName) {
        let found2 = await this.factoryExist(factoryName, 'git')
        if (found2) {
          targetDir = found2
          isUpdate = true
        }
      }
    }

    targetDir = targetDir || join(config?.rootDirectory, config?.directoryName, factoryName)
    remoteUrl =
      remoteUrl ||
      (await git.remoteUrl({
        cwd: targetDir
      }))

    this.debug({ remoteUrl, targetDir, isUpdate, factoryName })

    const styledName = this.style.cyan(factoryName)
    const spinner = this.createSpinner(`${isUpdate ? 'Updating' : 'Adding'} ${styledName}`).start()

    if (!remoteUrl) {
      spinner.fail(`Can not resolve git url`)
      return null
    }

    try {
      if (isUpdate) {
        await git.hardReset('', {
          cwd: targetDir
        })
        await git.pull('', {
          cwd: targetDir
        })
      } else {
        const urlValid = await this.checkGitUrl(remoteUrl)
        if (!urlValid) {
          spinner.fail(`Failed to add ${factoryName}`)
          return null
        }

        await git.clone(`${remoteUrl} ${targetDir}`, {
          stdout: 'inherit'
        })
      }

      spinner.succeed(`${isUpdate ? 'Updated' : 'Added'} ${styledName}`)
      await this.installProdDeps(flags || {}, targetDir)

      const factory = this.factory.createFactory(targetDir)
      if (!factory) {
        return null
      }

      // save to store
      const data = {
        id: factory.id,
        type: 'git',
        from: remoteUrl,
        path: targetDir,
        updatedAt: Date.now()
      }
      this.debug('Save to store:', data)
      this.store.set(data.id, data)

      const { version, global } = await this.getVersionInfo(factory)
      if (version) {
        this.store.set(`${factory.id}.version`, version)
      }
      if (global) {
        this.store.set(`${factory.id}.global`, global)
      }

      return factory
    } catch (err) {
      spinner.fail(`Failed to ${isUpdate ? 'update' : 'add'} ${name}`)
      this.error(err)
    }

    return null
  }

  private async factoryExist(name: string, type: 'npm' | 'git', cwd = process.cwd()) {
    const config = this.context.get('config')
    const targetDir =
      type === 'npm'
        ? join(cwd, 'node_modules', name)
        : join(config?.rootDirectory, config?.directoryName, name)
    const exist = await this.fs.pathExists(targetDir)
    return exist ? targetDir : ''
  }

  private async installProdDeps(flags: Record<string, any>, targetDir: string) {
    const spinner = this.createSpinner(`Installing dependencies...`).start()
    try {
      process.env.NODE_ENV = 'production'
      const env = this.context.get('env')
      const pm =
        flags.packageManager || (env.hasYarn ? 'yarn' : this.context.get('config').packageManager)
      await this.exec.command(`${pm} install`, {
        cwd: targetDir,
        stdout: 'ignore',
        env: {
          ...process.env,
          NODE_ENV: 'production'
        }
      })
      spinner.succeed(`Installed dependencies`)
    } catch (err) {
      spinner.fail('Failed to install dependencies. You can install them manually.')
      this.error(err)
    }
  }

  private async getVersionInfo(factory: Factory | null) {
    if (!factory) {
      return {}
    }
    const config = this.context.get('config')
    const factoriesDir = join(config.rootDirectory, config.directoryName)
    const versionInfo = await factory.version?.init()

    return {
      version: {
        baseDir: factoriesDir,
        ...versionInfo
      },
      global: factory.isGlobal
    }
  }
}
