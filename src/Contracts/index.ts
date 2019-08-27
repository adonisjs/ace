/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { ParsedOptions } from 'getopts'
import { PromptContract } from '@poppinss/prompts'
import { Kleur } from 'kleur'

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
  logs: string[],
  prompt: PromptContract,
  colors: Kleur,
  handle (): Promise<void>,
  $log (text: string, ...optionalParams: any[]): void,
  $logError (text: string, ...optionalParams: any[]): void,
  $success (text: string, ...optionalParams: any[]),
  $info (text: string, ...optionalParams: any[]),
  $error (text: string, ...optionalParams: any[]),
  $warning (text: string, ...optionalParams: any[]),
  $complete (text: string, ...optionalParams: any[]),
  $note (text: string, ...optionalParams: any[]),
  $await (text: string, ...optionalParams: any[]),
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
 * List of named labels for which we can print fancy logs
 */
export type LabelsList = 'success' | 'error' | 'warning' | 'info' | 'complete' | 'note' | 'await'
