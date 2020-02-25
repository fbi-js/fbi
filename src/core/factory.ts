import { BaseClass } from './base'
import { Command } from './command'
import { Template } from './template'
import { Plugin } from './plugin'

export type FactoryConstructor = {
  new (...args: any[]): Factory
}

export abstract class Factory extends BaseClass {
  public abstract id = ''
  public commands: Command[] = []
  public templates: Template[] = []
  public plugins: Plugin[] = []
  public description: string = ''

  public resolveTemplate(templateId: string) {
    const template = this.templates.find(x => x.id === templateId)
    if (!template) {
      this.debug(`Factory (${this.id}):`, `template "${templateId}" not found`)
    } else {
      this.debug(`Factory (${this.id}):`, `found template "${templateId}"`)
    }

    return template
  }

  // public createCommand(option: any): ICommand {
  //   this.log(`Factory: (${this.id})`, `createCommand ${option.id}`)
  //   const command: ICommand = new Command(option.id)
  //   this.commands.push(command)
  //   return command
  // }

  // public createTemplate(option: any): AbstractTemplate {
  //   this.log(`Factory: (${this.id})`, `createTemplate ${option.id}`)
  //   const template: AbstractTemplate = new Template(option.id)
  //   this.templates.push(template)
  //   return template
  // }

  // public createPlugin(option: any): AbstractPlugin {
  //   this.log(`Factory: (${this.id})`, `createPlugin ${option.id}`)
  //   const plugin: AbstractPlugin = new Plugin(option.id)
  //   this.plugins.push(plugin)
  //   return plugin
  // }

  public runCommand(...args: any[]): void {
    const id = args[0]
    const command = this.commands.find(x => x.id === id || x.alias === id)
    if (command) {
      // run plugins
      command.run()
    } else {
      this.error(`Factory: (${this.id})`, `Command ${id} not found`)
    }
  }

  public runTemplate(...args: any[]): void
  public runTemplate(id: string): void {
    const template = this.templates.find(x => x.id === id)
    if (template) {
      template.run()
    } else {
      this.error(`Factory: (${this.id})`, `template ${id} not found`)
    }
  }
}
