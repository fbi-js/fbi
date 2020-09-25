import { BaseClass } from './base'

export abstract class Command extends BaseClass {
  public abstract id = ''
  alias = ''
  args = ''
  flags: any[][] = []
  description = ''
  examples: string[] = []

  public abstract run(...args: any[]): void
  public disable(): boolean | string | Promise<boolean | string> {
    return false
  }
}
