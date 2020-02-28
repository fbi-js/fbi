import { join } from 'path'
import { Fbi } from '../fbi'
import { Command } from '../core/command'
import { git, isGitUrl } from '../utils'

export default class CommandCreate extends Command {
  id = 'add'
  alias = ''
  args = '<repositories...>'
  description = `add factories from remote git repositories`
  flags = []

  constructor(public factory: Fbi) {
    super()
  }

  public async run(repositories: any, flags: any) {
    const config = this.context.get('config')
    const rootDir = join(config.rootDirectory, config.directoryName)

    for (let repo of repositories) {
      const info = await this.checkGitUrl(repo, config)
      if (!info) {
        continue
      }

      const targetDir = join(rootDir, info.name)
      if (await this.fs.pathExists(targetDir)) {
        this.error(`'${info.name}' already exist`)
        continue
      }

      this.debug(`git clone ${info.url} ${targetDir}`)
      await this.add(info.name, info.url, targetDir)

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
    }
  }

  private async checkGitUrl(url: string, { organization }: any) {
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
    const name = gitUrl
      .split('/')
      .pop()
      ?.replace('.git', '')
    if (!name) {
      this.error(`invalid url:`, gitUrl)
      return null
    }
    const spinner = this.createSpinner(`Checking remote url '${gitUrl}'`).start()
    const remoteExist = await git.remoteExist(gitUrl)
    if (!remoteExist) {
      spinner.fail(`Remote path not exist: ${gitUrl}`)
      return null
    }
    spinner.succeed(`Passed: ${gitUrl}`)

    return {
      name,
      url: gitUrl
    }
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
}
