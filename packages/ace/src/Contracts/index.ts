/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

export type CommandArg = {
  name: string,
  required: boolean,
}

export type CommandFlag = {
  name: string,
  alias?: string,
  default?: any,
  type: 'string' | 'boolean',
}

export interface CommandConstructorContract {
  args: CommandArg[],
  flags: CommandFlag[],
  commandName: string,
  new (): CommandContract,
}

export interface CommandContract {
  handle (): Promise<void>,
}
