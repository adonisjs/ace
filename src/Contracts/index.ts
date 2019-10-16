/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { Kleur } from 'kleur'
import { ParsedOptions } from 'getopts'
import { PromptContract } from '@poppinss/prompts'
import { Logger } from '@poppinss/fancy-logs'

/**
 * The types of flags can be defined on a command.
 */
export type FlagTypes = 'string' | 'number' | 'boolean' | 'array' | 'numArray'

/**
 * The types of arguments can be defined on a command.
 */
export type ArgTypes = 'string' | 'spread'

/**
 * The shape of command argument
 */
export type CommandArg = {
  propertyName: string,
  name: string,
  type: ArgTypes,
  required: boolean,
  description?: string,
}

/**
 * The shape of a command flag
 */
export type CommandFlag = {
  propertyName: string,
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
  commands: SerializedCommandContract[],
}[]

/**
 * The shared properties that exists on the command implementation
 * as well as it's serialized version
 */
export interface SerializedCommandContract {
  args: CommandArg[],
  settings: any,
  flags: CommandFlag[],
  commandName: string,
  description: string,
}

/**
 * Command constructor shape with it's static properties
 */
export interface CommandConstructorContract extends SerializedCommandContract {
  new (rawMode?: boolean): CommandContract,
}

/**
 * The shape of command class
 */
export interface CommandContract {
  parsed?: ParsedOptions,
  logger: Logger,
  prompt: PromptContract,
  colors: Kleur,
  handle (): Promise<void>,
}

/**
 * Shape of the serialized command inside the manifest JSON file.
 */
export type ManifestCommand = SerializedCommandContract & { commandPath: string }

/**
 * Shape of manifest JSON file
 */
export type ManifestNode = {
  [command: string]: ManifestCommand,
}

/**
 * Callbacks for different style of hooks
 */
export type FindHookCallback = (command: SerializedCommandContract | null) => Promise<void> | void
export type RunHookCallback = (command: CommandContract) => Promise<void> | void
