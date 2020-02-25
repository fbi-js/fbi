import { Fbi } from '../fbi'
import { Factory } from '../core/Factory'
import { Command } from '../core/command'
import { Template } from '../core/template'
import { groupBy, flatten, isValidArray } from '@fbi-js/utils'

export default class CommandCreate extends Command {
  id = 'create'
  alias = 'c'
  args = '[template] [project]'
  description = `create a project via template`
  flags = [['-p, --package-manager <name>', 'Specifying a package manager. e.g. pnpm/yarn/npm']]

  constructor(public factory: Fbi) {
    super()
  }

  async run(template: any, project: any, flags: any) {
    // get all templates
    const factories = this.factory.createAllFactories()
    const templates = flatten(factories.map((f: Factory) => f.templates))

    let templateInstances
    if (template) {
      templateInstances = templates.filter((t: Template) => t.id === template)
      if (!isValidArray(templateInstances)) {
        return this.error(`template "${template}" not found`).exit()
      }
    }

    templateInstances = groupBy(
      (isValidArray(templateInstances) && templateInstances) || templates,
      'factory.id'
    )

    const { selected } = await this.prompt({
      type: 'select',
      name: 'selected',
      message: template ? 'Confirm which template to use' : 'Choose a template',
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
    })

    const selectedTemplate = templates.find(
      (t: Template) => t.id === selected.templateId && t.factory.id === selected.factoryId
    )

    if (selectedTemplate) {
      // set init data
      const info: any = await selectedTemplate.run({
        factory: {
          ...this.store.get(selected.factoryId),
          id: selected.factoryId,
          template: selected.templateId
        }
      })

      // update store
      this.debug(`Save project info to store`)
      this.store.merge(`${selectedTemplate.factory.id}.projects`, [
        {
          ...info.project,
          // version: version.latest,
          template: selectedTemplate.id,
          createdAt: Date.now()
        }
      ])
    }
  }
}
