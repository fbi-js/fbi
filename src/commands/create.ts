import { Fbi } from '../fbi'
import { Factory } from '../core/Factory'
import { Command } from '../core/command'
import { Template } from '../core/template'
import { basename, join, relative } from 'path'
import { groupBy, flatten, isValidArray } from '../utils'

export default class CommandCreate extends Command {
  id = 'create'
  alias = ''
  args = '[template|factory] [project]'
  description = `create a project via template or factory`
  flags = [
    ['-p, --package-manager <name>', 'Specifying a package manager. e.g. pnpm/yarn/npm', 'npm']
  ]
  factories: Factory[] = []

  constructor(public factory: Fbi) {
    super()
  }

  async run(factoryOrTemplateName: any, projectName: any, flags: any) {
    this.debug(`Running command "${this.id}" from factory "${this.factory.id}" with options:`, {
      factoryOrTemplateName,
      projectName,
      flags
    })
    let templates
    let useSubTemplate = false

    const cwd = process.cwd()
    // if is fbi project
    const usingFactory = this.context.get('config.factory')
    const { subDirectory, targetDir } = await this.getTargetDir(projectName)

    if (factoryOrTemplateName) {
      // search factory by name
      const foundFactory = this.factory.resolveFactory(factoryOrTemplateName)
      if (foundFactory) {
        const factoryPath = foundFactory.options?.rootDir
          ? relative(cwd, foundFactory.options.rootDir)
          : ''
        this.log(
          `Using ${this.style.bold`${foundFactory.id}@${foundFactory._version}`}${
            factoryPath ? ' from ' + factoryPath : ''
          }...`
        )
        templates = foundFactory.templates
      }

      // search all templates by name
      if (!isValidArray(templates)) {
        templates = this.factory.resolveTemplates(factoryOrTemplateName)
      }

      if (!isValidArray(templates)) {
        // not found, add factory
        const factory = await this.addFromRemote(factoryOrTemplateName, {
          ...flags,
          targetDir,
          yes: true
        })

        if (factory && factory.templates) {
          templates = factory.templates
        } else {
          this.error(`No package named '${factoryOrTemplateName}' found in npmjs.com`)
          this.error(`No repository named '${factoryOrTemplateName}' found in github.com`)
        }
      }
    } else {
      if (usingFactory) {
        const factory = this.factory.resolveFactory(usingFactory.id)
        const template = factory?.resolveTemplate(usingFactory.template)
        templates = template?.templates || []
        if (isValidArray(templates)) {
          const { templateType } = (await this.prompt({
            type: 'select',
            name: 'templateType',
            hint: 'Use arrow-keys, <return> to submit',
            message: `Pick an action:`,
            choices: ['Use sub templates', 'Use other templates', 'Cancel']
          })) as any
          useSubTemplate = templateType === 'Use sub templates'
        }
      }

      if (!useSubTemplate) {
        this.factory.createAllFactories()
        templates = this.factory.resolveTemplates()
      }
    }

    if (!isValidArray(templates)) {
      this.error('No templates available').exit()
    }

    const template = await this.selectTempate(templates as [])

    if (template) {
      await this.createProject({
        template,
        subDirectory,
        targetDir,
        flags,
        useSubTemplate
      })
    }
  }

  private async createProject({
    template,
    subDirectory,
    targetDir,
    flags,
    useSubTemplate = false
  }: {
    template: Template
    subDirectory?: string
    targetDir: string
    flags: any
    useSubTemplate: boolean
  }) {
    if (!template) {
      this.exit()
    }

    // get init data
    const factory = template.factory
    const storeInfo = this.store.get(factory.id)

    const info: Record<string, any> = await template.run(
      {
        factory: {
          id: factory.id,
          path: storeInfo?.version?.latest?.dir || factory.options.rootDir,
          version: storeInfo?.version?.latest?.short ?? '',
          template: template.id
        },
        project: {
          name: basename(targetDir)
        },
        subDirectory
      },
      flags
    )

    if (!info || !info.path) {
      return
    }

    // update store
    this.debug(`Save info into project store`)
    this.projectStore.merge(
      info.path,
      useSubTemplate
        ? {
            features: info.features,
            updatedAt: Date.now()
          }
        : {
            name: info.name,
            path: info.path,
            factory: factory.id,
            version: factory.version?.latest?.short ?? '',
            template: template.id,
            features: info.features,
            createdAt: Date.now()
          }
    )
  }

  private async selectTempate(templates: Template[], factoryOrTemplateName?: string) {
    const _choices = groupBy(templates, 'factory.id')
    const choices = flatten(
      Object.entries(_choices).map(([key, val]: any) =>
        [{ role: 'separator', message: `\n※ ${key}:` }].concat(
          val.map((t: Template) => ({
            name: t.id, // template name
            value: t.factory.id, // factory name
            hint: t.description // show messgae
          }))
        )
      )
    )

    const { selected } = (await this.prompt({
      type: 'select',
      name: 'selected',
      message: factoryOrTemplateName ? 'Confirm which template to use' : 'Choose a template',
      hint: 'Use arrow-keys, <return> to submit',
      choices,
      result(templateId: any) {
        return {
          templateId,
          factoryId: this.focused.value
        } as any
      }
    })) as any

    if (!selected) {
      return null
    }

    return templates?.find(
      (t: Template) => t.id === selected.templateId && t.factory.id === selected.factoryId
    )
  }

  private async getTargetDir(dir = process.cwd()) {
    const { action } = await this.prompt<{ action: string }>({
      type: 'select',
      name: 'action',
      hint: 'Use arrow-keys, <return> to submit',
      message: `Create project in:`,
      choices: [
        {
          message: 'Current directory',
          name: 'current'
        },
        {
          message: 'New subdirectory',
          name: 'subDirectory'
        },
        {
          message: 'Cancel',
          name: 'cancel'
        }
      ]
    })

    switch (action) {
      case 'subDirectory': {
        const { subDirectory } = await this.prompt<{ subDirectory: string }>({
          type: 'input',
          name: 'subDirectory',
          message: 'Subdirectory path'
        })
        const targetDir = join(dir, subDirectory ?? '')
        return {
          targetDir,
          subDirectory
        }
      }
      case 'cancel':
        this.exit()
        break
      default:
        break
    }

    return {
      targetDir: dir
    }
  }

  private async addFromRemote(name: string, flags: any) {
    const commandAdd = this.factory.resolveCommand('add')
    if (!commandAdd) {
      return this.error(
        `"${name}" not found in factories and templates. Can not add remote factory "${name}" because command 'add' not found.`
      ).exit(1)
    }

    const addedFacories: Factory[] = await commandAdd.run([name], flags)
    return addedFacories[0]
  }
}
