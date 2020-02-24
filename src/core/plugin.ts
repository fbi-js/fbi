import { BaseClass } from './base'
// export interface IPlugin {
//   id: string
// }

export abstract class Plugin extends BaseClass {
  public abstract id = ''
  beforeEachCommand(...args: any[]): any {
    console.log('roaming the earth...')
  }
  // beforeEachCommand<(...args: any[]) => any> = (...args: any[]) => void
}
