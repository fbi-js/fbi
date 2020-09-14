import { Fbi } from '../fbi'
import { Factory } from '../core/Factory'
import { Command } from '../core/command'
import { Template } from '../core/template'
import { groupBy, flatten, isValidArray } from '../utils'

export default class CommandCreate extends Command {
  id = 'create'
  alias = ''
  args = '[template｜factory] [project]'
  description = `create a project via template or factory`
  flags = [
    ['-p, --package-manager <name>', 'Specifying a package manager. e.g. pnpm/yarn/npm', 'npm']
  ]

  constructor(public factory: Fbi) {
    super()
  }

  async run(inputTemplate: any, project: any, flags: any) {
    const factories = this.factory.createAllFactories()

    // if is fbi project
    const usingFactory = this.context.get('config.factory')
    let subTemplates

    if (usingFactory?.id) {
      this.debug(`current project using factory "${usingFactory.id}"`)
      const factory = this.factory.resolveFactory(usingFactory.id)
      // console.log({ factory })
      if (usingFactory.template) {
        const template = factory?.resolveTemplate(usingFactory.template)
        // console.log({ template })
        subTemplates = template?.templates
      }
    }
    // console.log({ subTemplates })

    if (usingFactory) {
      this.log()
      this.log(
        `current project is using template "${usingFactory.template}" from factory "${usingFactory.id}"`
      )
      this.log(`you can only use sub-templates`)
      if (!isValidArray(subTemplates)) {
        this.warn(`but there are no sub-templates`).exit()
      }
      this.log()
    }

    // get all templates
    // const factories = this.factory.createAllFactories()
    let templates = subTemplates || flatten(factories.map((f: Factory) => f.templates))

    let templateInstances
    if (inputTemplate) {
      templateInstances = templates.filter((t: Template) => t.id === inputTemplate)
      if (!isValidArray(templateInstances)) {
        // 若已有添加模板中不存在则添加远程模板
        const addCommand = this.factory.commands.find(it => it.id === 'add')
        await addCommand?.run([inputTemplate], flags)
        const nowFactories = this.factory.createAllFactories() || []
        const addFactory = nowFactories.find(it => it.id === inputTemplate)
        templates = flatten(nowFactories.map((f:Factory) => f.templates))
        templateInstances = addFactory?.templates
        if (!isValidArray(templateInstances)) {
          return this.error(`template "${inputTemplate}" not found`).exit()
        }
      }
    }


    templateInstances = groupBy(
      (isValidArray(templateInstances) && templateInstances) || templates,
      'factory.id'
    )

    const { selected } = await this.prompt({
      type: 'select',
      name: 'selected',
      message: inputTemplate ? 'Confirm which template to use' : 'Choose a template',
      hint: 'Use arrow-keys, <return> to submit',
      choices: flatten(
        Object.entries(templateInstances).map(([key, val]: any) => {
          return [{ role: 'separator', message: `\n※ ${key}:` }].concat(
            val.map((t: Template) => ({
              name: t.id, // template name
              value: t.factory.id, // factory name
              hint: t.description // show messgae
            }))
          )
        })
      ),
      result(templateId: string) {
        return {
          templateId,
          factoryId: this.focused.value
        }
      }
    } as any)

    const selectedTemplate: Template = templates.find(
      (t: Template) => t.id === selected.templateId && t.factory.id === selected.factoryId
    )

    if (selectedTemplate) {
      // set init data
      const factoryInfo = this.store.get(selected.factoryId)
      const info: Record<string, any> = await selectedTemplate.run(
        {
          factory: {
            id: factoryInfo.id,
            path: factoryInfo.version?.latest?.dir || factoryInfo.path,
            version: factoryInfo.version?.latest?.short,
            template: selected.templateId
          },
          project: {
            name: project
          }
        },
        flags
      )

      if (!info) {
        return
      }

      // update store
      this.debug(`Save info into project store`)
      if (subTemplates) {
        if (info.path) {
          this.projectStore.merge(info.path, {
            features: info.features,
            updatedAt: Date.now()
          })
        }
      } else {
        if (info.path) {
          this.projectStore.set(info.path, {
            name: info.name,
            path: info.path,
            factory: factoryInfo.id,
            version: factoryInfo.version?.latest?.short,
            template: selected.templateId,
            features: info.features,
            createdAt: Date.now()
          })
        }
      }
    }
  }
}
