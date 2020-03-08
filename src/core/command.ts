import { BaseClass } from './base'

export abstract class Command extends BaseClass {
  public abstract id = ''
  alias: string = ''
  args: string = ''
  flags: any[][] = []
  description: string = ''

  public abstract run(...args: any[]): void
  public disable(): boolean | string | Promise<boolean | string> {
    return false
  }
}
