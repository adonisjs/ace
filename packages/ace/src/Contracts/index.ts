/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

/**
 * The shape of command argument
 */
export type CommandArg = {
  name: string,
  required: boolean,
  description?: string,
}

/**
 * The shape of a command flag
 */
export type CommandFlag = {
  name: string,
  type: string,
  description?: string,
  alias?: string,
  default?: any,
}

/**
 * Shape of grouped commands. Required when displaying
 * help
 */
export type CommandsGroup = {
  group: string,
  commands: CommandConstructorContract[],
}[]

/**
 * Command constructor shape with it's static properties
 */
export interface CommandConstructorContract {
  args: CommandArg[],
  flags: CommandFlag[],
  commandName: string,
  description: string,
  new (): CommandContract,
}

/**
 * The shape of command class
 */
export interface CommandContract {
  handle (): Promise<void>,
}
