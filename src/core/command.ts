import { BaseClass } from './base'

// export interface ICommand {
//   id: string
//   run(...args: any[]): void
// }

// export abstract class Command extends BaseClass implements ICommand {
export abstract class Command extends BaseClass {
  public abstract id = ''
  alias: string = ''
  args: string = ''
  flags: string[][] = []
  description: string = ''

  public abstract run(...args: any[]): void
  // {
  //   this.error(`Factory: (${this.id})`, `You should implement the "run" method of the command`)
  //   // this.log(`Running command ${this.id} with args`, args)
  // }
}
