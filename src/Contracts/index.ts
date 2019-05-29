/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { ParsedOptions } from 'getopts'

export type FlagTypes = 'string' | 'number' | 'boolean' | 'array' | 'numArray'
export type ArgTypes = 'string' | 'spread'

/**
 * The shape of command argument
 */
export type CommandArg = {
  name: string,
  type: ArgTypes,
  required: boolean,
  description?: string,
}

/**
 * The shape of a command flag
 */
export type CommandFlag = {
  name: string,
  type: FlagTypes,
  description?: string,
  alias?: string,
  default?: any,
}

/**
 * The handler that handles the global
 * flags
 */
export type GlobalFlagHandler = (
  value: any,
  parsed: ParsedOptions,
  command?: CommandConstructorContract,
) => void

/**
 * Shape of grouped commands. Required when displaying
 * help
 */
export type CommandsGroup = {
  group: string,
  commands: HelpCommand[],
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
  parsed?: ParsedOptions,
  handle (): Promise<void>,
}

/**
 * Shape of a command inside the manifest file.
 */
export type ManifestCommand = Pick<
  CommandConstructorContract, Exclude<keyof CommandConstructorContract, 'new'>
> & { commandPath: string }

/**
 * Shape of manifest JSON file
 */
export type ManifestNode = {
  [command: string]: ManifestCommand,
}

/**
 * Shape of command required for the help screen. The node is a
 * neutral point between `CommandConstructor` and `ManifestCommand`.
 */
export type HelpCommand = Pick<ManifestCommand, Exclude<keyof ManifestCommand, 'commandPath'>>
