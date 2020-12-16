import { BaseClass } from './base'

export abstract class Plugin extends BaseClass {
  public abstract id = ''
  beforeEachCommand(...args: any[]): any {
    console.log('beforeEachCommand...')
  }
}
