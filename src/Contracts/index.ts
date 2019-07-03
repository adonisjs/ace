/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { ParsedOptions } from 'getopts'

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
 * List of named labels for which we can print fancy logs
 */
export type LabelsList = 'success' | 'error' | 'warning' | 'info' | 'complete' | 'note' | 'await'

/**
 * The state of prompt shared with the validate function
 */
export type PromptState<T extends any> = {
  type: string
  name: string,
  message: string,
  value: T,
}

/**
 * Shape of prompt validate function
 */
export type PromptValidationFunction<T extends PromptState<any>> = (
  value: T['value'],
  state: T,
) => boolean | string | Promise<boolean | string>

/**
 * Shape of prompt format function. It is called on every keystroke
 */
export type PromptFormatFunction<T extends any> = (value: T) => T | Promise<T>

/**
 * Prompt options for text based prompts
 */
export type TextPromptOptions = {
  default?: string,
  name?: string,
  format?: PromptFormatFunction<string>,
  validate?: PromptValidationFunction<PromptState<string>>,
}

/**
 * Prompt options for the choice prompt
 */
export type ChoicePromptOptions = {
  default?: string,
  name?: string,
  format?: PromptFormatFunction<string>,
  validate?: PromptValidationFunction<PromptState<string> & { choices: PromptChoice[] }>,
}

export type MultiplePromptOptions = {
  default?: string[],
  name?: string,
  format?: PromptFormatFunction<string[]>,
  validate?: PromptValidationFunction<PromptState<string[]> & { choices: PromptChoice[] }>,
}

/**
 * Shape of boolean prompts
 */
export type BooleanPromptOptions = {
  default?: boolean,
  name?: string,
  format?: PromptFormatFunction<boolean>,
  validate?: PromptValidationFunction<PromptState<boolean>>,
}

/**
 * Options for a toggle prompt
 */
export type TogglePromptOptions = {
  default?: boolean,
  name?: string,
  format?: PromptFormatFunction<string>,
  validate?: PromptValidationFunction<PromptState<boolean>>,
}

/**
 * The following options are passed to the emitter `prompt`
 * event handler
 */
export type PromptEventOptions = {
  name: string,
  type: string,
  message: string,
  initial?: string | boolean | string[],
  format?: PromptFormatFunction<any>,
  validate?: PromptValidationFunction<any>,
  answer (answer: any): Promise<void>,
  accept (): Promise<void>,
  decline (): Promise<void>,
  select (index: number): Promise<void>,
  multiSelect (indexes: number[]): Promise<void>,
}

/**
 * Shape of the prompt choice
 */
export type PromptChoice = {
  name: string,
  message?: string,
  value?: string,
  hint?: string,
  disabled?: boolean,
}

/**
 * Shape of prompts class.
 */
export interface PromptContract {
  ask (title: string, options?: TextPromptOptions): Promise<string>,
  secure (title: string, options?: TextPromptOptions): Promise<string>,
  confirm (title: string, options?: BooleanPromptOptions): Promise<boolean>,
  toggle (title: string, choices: [string, string], options?: TogglePromptOptions): Promise<boolean>,
  choice (title: string, choices: (string | PromptChoice)[], options?: ChoicePromptOptions): Promise<string>,

  multiple (
    title: string,
    choices: (string | PromptChoice)[],
    options?: MultiplePromptOptions,
  ): Promise<string[]>,

  on (event: 'prompt', callback: (options: PromptEventOptions) => any): this,
  on (event: 'prompt:error', callback: (message: string) => any): this,
  on (event: 'prompt:answer', callback: (message: any) => any): this,
  on (event: string, callback: (...args: any[]) => any): this,
}
