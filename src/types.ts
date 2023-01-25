/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { cliui } from '@poppinss/cliui'
import type { Arguments, Options } from 'yargs-parser'
import type { HookHandler } from '@poppinss/hooks/types'

import type { Kernel } from './kernel.js'
import type { BaseCommand } from './commands/base.js'

/**
 * Parsed output of yargs
 */
export type YargsOutput = Arguments

/**
 * Parsed output from the parser
 */
export type ParsedOutput = YargsOutput & {
  /**
   * Parsed arguments
   */
  args: (any | any[])[]

  /**
   * Left over arguments after parsing flags
   * and args
   */
  _: Array<string | number>

  /**
   * An array of unknown flags that were parsed
   */
  unknownFlags: string[]

  /**
   * List of parsed flags
   */
  flags: {
    [argName: string]: any
  }
}

/**
 * The UI primitives used by commands
 */
export type UIPrimitives = ReturnType<typeof cliui>

/**
 * All loaders must adhere to the LoadersContract
 */
export interface LoadersContract {
  /**
   * The method should return an array of commands metadata
   */
  getMetaData(): Promise<CommandMetaData[]>

  /**
   * The method should return the command instance by command
   * name
   */
  getCommand(command: CommandMetaData): Promise<typeof BaseCommand | null>
}

/**
 * Command executor is used to create a new instance of the command
 * and run it.
 */
export interface ExecutorContract<Command extends typeof BaseCommand> {
  /**
   * Create a new instance of the command
   */
  create(
    command: Command,
    parsedOutput: ParsedOutput,
    kernel: Kernel<Command>
  ): Promise<InstanceType<Command>> | InstanceType<Command>

  /**
   * Run the command
   */
  run<Instance extends InstanceType<Command>>(
    command: Instance,
    kernel: Kernel<Command>
  ): Promise<Instance>
}

/**
 * Parser options accepted by the yargs to process
 * flags
 */
export type FlagsParserOptions = {
  all: string[]
  array?: string[]
  boolean?: Options['boolean']
  string?: Options['string']
  number?: Options['boolean']
  default?: Options['default']
  coerce?: Options['coerce']
  alias?: Options['alias']
  count?: Options['count']
}

/**
 * The options accepted by the arguments parser
 */
export type ArgumentsParserOptions = {
  type: 'string' | 'spread'
  default?: any
  parse?: (value: any) => any
}

/**
 * Options for defining an argument
 */
export type BaseArgument<T> = {
  name: string
  argumentName: string
  required?: boolean
  description?: string
  default?: T
}

/**
 * Type for a string argument
 */
export type StringArgument<T> = BaseArgument<T> & {
  type: 'string'

  /**
   * Whether or not to allow empty values. When set to false,
   * the validation will fail if the argument is provided
   * an empty string
   *
   * Defaults to false
   */
  allowEmptyValue?: boolean
  parse?: (input: T) => T
}

/**
 * Type for a spread argument
 */
export type SpreadArgument<T extends any> = BaseArgument<T> & {
  type: 'spread'

  /**
   * Whether or not to allow empty values. When set to false,
   * the validation will fail if the argument is provided
   * an empty string
   *
   * Defaults to false
   */
  allowEmptyValue?: boolean
  parse?: (input: T extends any[] ? T : [T]) => T
}

/**
 * A union of known arguments
 */
export type Argument = StringArgument<any> | SpreadArgument<any>

/**
 * Base properties for a flag
 */
export type BaseFlag<T> = {
  name: string
  flagName: string
  required?: boolean
  default?: T
  description?: string
  alias?: string | string[]
}

/**
 * String flag
 */
export type StringFlag<T> = BaseFlag<T> & {
  type: 'string'

  /**
   * Whether or not to allow empty values. When set to false,
   * the validation will fail if the flag is mentioned but
   * no value is provided
   *
   * Defaults to false
   */
  allowEmptyValue?: boolean
  parse?: (input: T) => T
}

/**
 * Boolean flag
 */
export type BooleanFlag<T> = BaseFlag<T> & {
  type: 'boolean'

  /**
   * Whether or not to display the negated variant in the
   * help output.
   *
   * Applicable for boolean flags only
   *
   * Defaults to false
   */
  showNegatedVariantInHelp?: boolean
  parse?: (input: T) => T
}

/**
 * Number flag
 */
export type NumberFlag<T> = BaseFlag<T> & {
  type: 'number'
  parse?: (input: T) => T
}

/**
 * An array of string flag
 */
export type ArrayFlag<T extends any> = BaseFlag<T> & {
  type: 'array'

  /**
   * Whether or not to allow empty values. When set to false,
   * the validation will fail if the flag is mentioned but
   * no value is provided
   *
   * Defaults to false
   */
  allowEmptyValue?: boolean

  parse?: (input: T) => T
}

/**
 * A union of known flags
 */
export type Flag = StringFlag<any> | BooleanFlag<any> | NumberFlag<any> | ArrayFlag<any>

/**
 * Command metdata required to display command help.
 */
export type CommandMetaData = {
  /**
   * Help text for the command
   */
  help?: string | string[]

  /**
   * The name of the command
   */
  commandName: string

  /**
   * The command description to show on the help
   * screen
   */
  description: string

  /**
   * Command namespace. The namespace is extracted
   * from the command name
   */
  namespace: string | null

  /**
   * Command aliases. The same command can be run using
   * these aliases as well.
   */
  aliases: string[]

  /**
   * Flags accepted by the command
   */
  flags: Omit<Flag, 'parse'>[]

  /**
   * Args accepted by the command
   */
  args: Omit<Argument, 'parse'>[]

  /**
   * Command configuration options
   */
  options: CommandOptions
}

/**
 * Static set of command options
 */
export type CommandOptions = {
  /**
   * Whether or not to allow for unknown flags. If set to false,
   * the command will not run when unknown flags are provided
   * through the CLI
   *
   * Defaults to false
   */
  allowUnknownFlags?: boolean

  /**
   * When flag set to true, the kernel will not trigger the termination
   * process unless the command explicitly calls the terminate method.
   *
   * Defaults to false
   */
  staysAlive?: boolean
}

/**
 * Finding hook handler and data
 */
export type FindingHookArgs = [[string], [string]]
export type FindingHookHandler = HookHandler<FindingHookArgs[0], FindingHookArgs[1]>

/**
 * Found hook handler and data
 */
export type LoadingHookArgs = [[CommandMetaData], [CommandMetaData]]
export type LoadingHookHandler = HookHandler<LoadingHookArgs[0], LoadingHookArgs[1]>

/**
 * Found hook handler and data
 */
export type LoadedHookArgs = [[typeof BaseCommand], [typeof BaseCommand]]
export type LoadedHookHandler = HookHandler<LoadedHookArgs[0], LoadedHookArgs[1]>

/**
 * Executing hook handler and data
 */
export type ExecutingHookArgs = [[BaseCommand, boolean], [BaseCommand, boolean]]
export type ExecutingHookHandler = HookHandler<ExecutingHookArgs[0], ExecutingHookArgs[1]>

/**
 * Executed hook handler and data
 */
export type ExecutedHookArgs = ExecutingHookArgs
export type ExecutedHookHandler = ExecutingHookHandler

/**
 * Terminating hook handler and data
 */
export type TerminatingHookArgs = [[BaseCommand?], [BaseCommand?]]
export type TerminatingHookHandler = HookHandler<TerminatingHookArgs[0], TerminatingHookArgs[1]>

/**
 * A listener that listeners for flags when they are mentioned.
 */
export type FlagListener<Command extends typeof BaseCommand> = (
  command: Command,
  kernel: Kernel<Command>,
  parsedOutput: ParsedOutput
) => any | Promise<any>

/**
 * Commands and options list table
 */
export type ListTable = {
  columns: {
    option: string
    description: string
  }[]
  heading: string
}

/**
 * A union of data types allowed for the info key-value pair
 */
export type AllowedInfoValues = number | boolean | string | string[] | number[] | boolean[]
