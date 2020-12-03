import { sep } from 'path'
import { Fbi } from '../fbi'
import { Factory } from '../core/Factory'
import { Command } from '../core/command'
import { Template } from '../core/template'
import { groupBy, flatten, isValidArray, isDirEmpty } from '../utils'

export default class CommandCreate extends Command {
  id = 'create'
  alias = ''
  args = '[template|factory]'
  description = `create a project via template or factory`
  flags = [
    ['-p, --package-manager <name>', 'Specifying a package manager. e.g. pnpm/yarn/npm', 'npm']
  ]
  factories: Factory[] = []

  constructor(public factory: Fbi) {
    super()
  }

  async run(inputName: any, flags: any) {
    this.debug(`Running command "${this.id}" from factory "${this.factory.id}" with options:`, {
      inputName,
      flags
    })
    let template
    let isSubTemplate = false
    let createSubDirectory = false

    const cwd = process.cwd()

    this.factories = this.factory.createAllFactories()

    // if is fbi project
    const usingFactory = this.context.get('config.factory')

    if (usingFactory) {
      template = await this.createViaSubTemplate(usingFactory)
      isSubTemplate = true
    } else {
      const action = await this.checkDirEmpty(cwd)
      createSubDirectory = action === 'subDirectory'

      if (inputName) {
        template = await this.createViaTargetTemplate(inputName, flags)
      } else {
        const allTemplates = this.factory.resolveTemplates()
        template = await this.selectTempate(allTemplates)
      }
    }

    if (template) {
      await this.createProject(template, createSubDirectory, flags, isSubTemplate, cwd)
    }
  }

  private async createViaSubTemplate(usingFactory: any) {
    let templates
    if (usingFactory?.id) {
      this.debug(`current project using factory "${usingFactory.id}"`)
      const factory = this.factory.resolveFactory(usingFactory.id)
      if (usingFactory.template) {
        const template = factory?.resolveTemplate(usingFactory.template)
        templates = template?.templates
      }
    }

    if (usingFactory) {
      this.log()
      this.log(
        `current project is using template ${this.style.cyan(
          usingFactory.template
        )} from ${this.style.cyan(usingFactory.id)}`
      )
      this.log(`you can only use sub-templates`)
      if (!isValidArray(templates)) {
        this.warn(`but there are no sub-templates`).exit()
      }
      this.log()
    }

    return this.selectTempate(templates || [])
  }

  private async createViaTargetTemplate(inputName: string, flags: any) {
    let templates
    // search factory by name
    const foundFactory = this.factory.resolveFactory(inputName)
    templates = foundFactory?.templates

    if (!isValidArray(templates)) {
      // search all templates by name
      templates = this.factory.resolveTemplates(inputName)
    }

    if (!isValidArray(templates)) {
      // not found, add factory
      const commandAdd = this.factory.resolveCommand('add')
      if (!commandAdd) {
        this.error(
          `"${inputName}" not found in factories and templates. Can not add remote factory "${inputName}" because command 'add' not found.`
        ).exit(1)
      }

      const addedFacories: Factory[] = await commandAdd?.run([inputName], flags)
      const addedFacory = addedFacories[0]
      if (addedFacory) {
        this.factories.push(addedFacory)
      }
      // use added factory's tempaltes
      templates = addedFacory?.templates
    }

    if (!isValidArray(templates)) {
      return this.error(`template or factory "${inputName}" not found`).exit()
    }

    return this.selectTempate(templates || [], inputName)
  }

  private async createProject(
    template: Template,
    subDirectory = false,
    flags: any,
    isSubTemplate = false,
    cwd = process.cwd()
  ) {
    if (!template) {
      this.exit()
    }
    const projectName = cwd.split(sep).pop()

    // set init data
    const factoryInfo = this.store.get(template?.factory?.id)
    if (!factoryInfo) {
      this.warn(`can not resolve factory info '${template?.factory?.id}'`)
      this.exit()
    }
    const info: Record<string, any> = await template.run(
      {
        factory: {
          id: factoryInfo.id,
          path: factoryInfo.version?.latest?.dir || factoryInfo.path,
          version: factoryInfo.version?.latest?.short,
          template: template.id
        },
        project: {
          name: projectName
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
      isSubTemplate
        ? {
            features: info.features,
            updatedAt: Date.now()
          }
        : {
            name: info.name,
            path: info.path,
            factory: factoryInfo.id,
            version: factoryInfo.version?.latest?.short,
            template: template.id,
            features: info.features,
            createdAt: Date.now()
          }
    )
  }

  private async selectTempate(templates: Template[], inputName?: string) {
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
      message: inputName ? 'Confirm which template to use' : 'Choose a template',
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

  private async checkDirEmpty(dir: string) {
    if (await isDirEmpty(dir)) {
      return ''
    }

    const { action } = (await this.prompt({
      type: 'select',
      name: 'action',
      message: `Current directory is not empty. Pick an action:`,
      hint: 'Use arrow-keys, <return> to submit',
      choices: ['Overwrite', 'New subdirectory', 'Cancel']
    })) as any

    if (action === 'Cancel') {
      this.exit()
    }

    if (action === 'New subdirectory') {
      return 'subDirectory'
    }
  }
}
