const _ = require('./helpers/utils')
const copy = require('./helpers/copy')

module.exports = class Template {
  async init(params, dst, opts) {
    const name = params[0]
    const version = params[1]
    if (!name) {
      return false
    }

    const templatePath = _.join(opts.DATA_ROOT, opts.TEMPLATE_PREFIX + name)
    const templateExist = await _.exist(templatePath)
    const defaultPackage = require('../data-default/package-default.json')

    if (templateExist) {
      const projectName = process
        .cwd()
        .split('/')
        .pop()

      // checkout version
      await _.repoCheckout(templatePath, version)
      _.log(
        `Initializing template "${name} (${version ? version : 'master'})" ...`
      )

      const templatePackage = _.join(templatePath, 'package.json')
      if (await _.exist(templatePackage)) {
        const projectPackage = require(templatePackage)
        const localPackage = _.merge(defaultPackage, {
          name: projectName,
          dependencies: projectPackage.dependencies,
          fbi: {
            template: {
              name,
              version: version || 'master'
            }
          }
        })

        await _.write(
          _.join(dst, 'package.json'),
          JSON.stringify(localPackage, null, 2) + '\n'
        )
      }

      // copy files
      await copy(templatePath, dst, opts.TEMPLATE_INIT_IGNORE)
      return true
    }
    return false
  }

  async all(opts) {
    const ret = []
    const isTemplate = name => name.startsWith(opts.TEMPLATE_PREFIX)

    const items = await _.readDir(opts.DATA_ROOT)
    const templates = items.filter(isTemplate)

    await Promise.all(
      templates.map(async item => {
        try {
          const config = {}
          const tmplInfo = require(_.join(opts.DATA_ROOT, item, 'package.json'))
          ret.push({
            name: item.substr(opts.TEMPLATE_PREFIX.length, item.length),
            desc: tmplInfo.description || '',
            version: tmplInfo.version
          })
        } catch (err) {
          console.log(err)
        }
      })
    )

    return ret
  }

  async list(opts) {
    const name = opts.template.name
    const versions = await _.repoVersion(opts.template.path, '-n100')
    console.log(`
Template: ${opts.template.name}
Version: ${opts.template.version}
Description: ${opts.template.description}
Repository: ${opts.template.repo}
Path: ${opts.template.path}

Tags: 
${versions}`)
  }
}
