/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { inspect } from 'node:util'
import string from '@poppinss/utils/string'
import Macroable from '@poppinss/macroable'
import lodash from '@poppinss/utils/lodash'
import { AssertionError } from 'node:assert'
import type { Prompt } from '@poppinss/prompts'
import { defineStaticProperty, InvalidArgumentsException } from '@poppinss/utils'

import debug from '../debug.js'
import * as errors from '../errors.js'
import type { Kernel } from '../kernel.js'
import type {
  Flag,
  Argument,
  ParsedOutput,
  UIPrimitives,
  CommandOptions,
  CommandMetaData,
  FlagsParserOptions,
  ArgumentsParserOptions,
} from '../types.js'

/**
 * The base command sets the foundation for defining ace commands.
 * Every command should inherit from the base command.
 */
export class BaseCommand extends Macroable {
  static booted: boolean = false

  /**
   * Configuration options accepted by the command
   */
  static options: CommandOptions

  /**
   * A collection of aliases for the command
   */
  static aliases: string[]

  /**
   * The command name one can type to run the command
   */
  static commandName: string

  /**
   * The command description
   */
  static description: string

  /**
   * The help text for the command. Help text can be a multiline
   * string explaining the usage of command
   */
  static help?: string | string[]

  /**
   * Registered arguments
   */
  static args: Argument[]

  /**
   * Registered flags
   */
  static flags: Flag[]

  /**
   * Define static properties on the class. During inheritance, certain
   * properties must inherit from the parent.
   */
  static boot() {
    if (Object.hasOwn(this, 'booted') && this.booted === true) {
      return
    }

    this.booted = true
    defineStaticProperty(this, 'args', { initialValue: [], strategy: 'inherit' })
    defineStaticProperty(this, 'flags', { initialValue: [], strategy: 'inherit' })
    defineStaticProperty(this, 'aliases', { initialValue: [], strategy: 'inherit' })
    defineStaticProperty(this, 'commandName', { initialValue: '', strategy: 'inherit' })
    defineStaticProperty(this, 'description', { initialValue: '', strategy: 'inherit' })
    defineStaticProperty(this, 'help', { initialValue: '', strategy: 'inherit' })
    defineStaticProperty(this, 'options', {
      initialValue: { staysAlive: false, allowUnknownFlags: false },
      strategy: 'inherit',
    })
  }

  /**
   * Specify the argument the command accepts. The arguments via the CLI
   * will be accepted in the same order as they are defined.
   *
   * Mostly, you will be using the `@args` decorator to define the arguments.
   *
   * ```ts
   * Command.defineArgument('entity', { type: 'string' })
   * ```
   */
  static defineArgument(name: string, options: Partial<Argument> & { type: 'string' | 'spread' }) {
    this.boot()
    const arg = { name, argumentName: string.dashCase(name), required: true, ...options }
    const lastArg = this.args[this.args.length - 1]

    /**
     * Ensure the arg type is specified
     */
    if (!arg.type) {
      throw new InvalidArgumentsException(
        `Cannot define argument "${this.name}.${name}". Specify the argument type`
      )
    }

    /**
     * Ensure we are not adding arguments after a spread argument
     */
    if (lastArg && lastArg.type === 'spread') {
      throw new InvalidArgumentsException(
        `Cannot define argument "${this.name}.${name}" after spread argument "${this.name}.${lastArg.name}". Spread argument should be the last one`
      )
    }

    /**
     * Ensure we are not adding a required argument after an optional
     * argument
     */
    if (arg.required && lastArg && lastArg.required === false) {
      throw new InvalidArgumentsException(
        `Cannot define required argument "${this.name}.${name}" after optional argument "${this.name}.${lastArg.name}"`
      )
    }

    if (debug.enabled) {
      debug('defining arg %O, command: %O', arg, `[class: ${this.name}]`)
    }

    this.args.push(arg)
  }

  /**
   * Specify a flag the command accepts.
   *
   * Mostly, you will be using the `@flags` decorator to define a flag.
   *
   * ```ts
   * Command.defineFlag('connection', { type: 'string', required: true })
   * ```
   */
  static defineFlag(
    name: string,
    options: Partial<Flag> & { type: 'string' | 'boolean' | 'array' | 'number' }
  ) {
    this.boot()
    const flag = { name, flagName: string.dashCase(name), required: false, ...options }

    /**
     * Ensure the arg type is specified
     */
    if (!flag.type) {
      throw new InvalidArgumentsException(
        `Cannot define flag "${this.name}.${name}". Specify the flag type`
      )
    }

    if (debug.enabled) {
      debug('defining flag %O, command: %O', flag, `[class: ${this.name}]`)
    }

    this.flags.push(flag)
  }

  /**
   * Returns the options for parsing flags and arguments
   */
  static getParserOptions(options?: FlagsParserOptions): {
    flagsParserOptions: Required<FlagsParserOptions>
    argumentsParserOptions: ArgumentsParserOptions[]
  } {
    this.boot()

    const argumentsParserOptions: ArgumentsParserOptions[] = this.args.map((arg) => {
      return {
        type: arg.type,
        default: arg.default,
        parse: arg.parse,
      }
    })

    const flagsParserOptions: Required<FlagsParserOptions> = lodash.merge(
      {
        all: [],
        string: [],
        boolean: [],
        array: [],
        number: [],
        alias: {},
        count: [],
        coerce: {},
        default: {},
      },
      options
    )

    this.flags.forEach((flag) => {
      flagsParserOptions.all.push(flag.flagName)

      if (flag.alias) {
        flagsParserOptions.alias[flag.flagName] = flag.alias
      }
      if (flag.parse) {
        flagsParserOptions.coerce[flag.flagName] = flag.parse
      }
      if (flag.default !== undefined) {
        flagsParserOptions.default[flag.flagName] = flag.default
      }

      switch (flag.type) {
        case 'string':
          flagsParserOptions.string.push(flag.flagName)
          break
        case 'boolean':
          flagsParserOptions.boolean.push(flag.flagName)
          break
        case 'number':
          flagsParserOptions.number.push(flag.flagName)
          break
        case 'array':
          flagsParserOptions.array.push(flag.flagName)
          break
      }
    })

    return {
      flagsParserOptions,
      argumentsParserOptions,
    }
  }

  /**
   * Serializes the command to JSON. The return value satisfies the
   * {@link CommandMetaData}
   */
  static serialize(): CommandMetaData {
    this.boot()
    if (!this.commandName) {
      throw new errors.E_MISSING_COMMAND_NAME([this.name])
    }

    const [namespace, name] = this.commandName.split(':')

    return {
      commandName: this.commandName,
      description: this.description,
      help: this.help,
      namespace: name ? namespace : null,
      aliases: this.aliases,
      flags: this.flags.map((flag) => {
        const { parse, ...rest } = flag
        return rest
      }),
      args: this.args.map((arg) => {
        const { parse, ...rest } = arg
        return rest
      }),
      options: this.options,
    }
  }

  /**
   * Validate the yargs parsed output againts the command.
   */
  static validate(parsedOutput: ParsedOutput) {
    this.boot()

    /**
     * Validates args and their values
     */
    this.args.forEach((arg, index) => {
      const value = parsedOutput.args[index] as string
      const hasDefinedArgument = value !== undefined

      if (arg.required && !hasDefinedArgument) {
        throw new errors.E_MISSING_ARG([arg.name])
      }

      if (hasDefinedArgument && !arg.allowEmptyValue && (value === '' || !value.length)) {
        if (debug.enabled) {
          debug('disallowing empty value "%s" for arg: "%s"', value, arg.name)
        }

        throw new errors.E_MISSING_ARG_VALUE([arg.name])
      }
    })

    /**
     * Disallow unknown flags
     */
    if (!this.options.allowUnknownFlags && parsedOutput.unknownFlags.length) {
      const unknowFlag = parsedOutput.unknownFlags[0]
      const unknowFlagName = unknowFlag.length === 1 ? `-${unknowFlag}` : `--${unknowFlag}`
      throw new errors.E_UNKNOWN_FLAG([unknowFlagName])
    }

    /**
     * Validate flags
     */
    this.flags.forEach((flag) => {
      const hasMentionedFlag = Object.hasOwn(parsedOutput.flags, flag.flagName)
      const value = parsedOutput.flags[flag.flagName]

      /**
       * Validate the value by flag type
       */
      switch (flag.type) {
        case 'boolean':
          /**
           * If flag is required, then it should be mentioned
           */
          if (flag.required && !hasMentionedFlag) {
            throw new errors.E_MISSING_FLAG([flag.flagName])
          }
          break
        case 'number':
          /**
           * If flag is required, then it should be mentioned
           */
          if (flag.required && !hasMentionedFlag) {
            throw new errors.E_MISSING_FLAG([flag.flagName])
          }

          /**
           * Regardless of whether flag is required or not. If it is mentioned,
           * then some value should be provided.
           *
           * In case of number input, yargs sends undefined
           */
          if (hasMentionedFlag && value === undefined) {
            throw new errors.E_MISSING_FLAG_VALUE([flag.flagName])
          }

          if (Number.isNaN(value)) {
            throw new errors.E_INVALID_FLAG([flag.flagName, 'numeric'])
          }
          break
        case 'string':
        case 'array':
          /**
           * If flag is required, then it should be mentioned
           */
          if (flag.required && !hasMentionedFlag) {
            throw new errors.E_MISSING_FLAG([flag.flagName])
          }

          /**
           * Regardless of whether flag is required or not. If it is mentioned,
           * then some value should be provided, unless empty values are
           * allowed.
           *
           * In case of string, flag with no value receives an empty string
           * In case of array, flag with no value receives an empty array
           */
          if (hasMentionedFlag && !flag.allowEmptyValue && (value === '' || !value.length)) {
            if (debug.enabled) {
              debug('disallowing empty value "%s" for flag: "%s"', value, flag.name)
            }

            throw new errors.E_MISSING_FLAG_VALUE([flag.flagName])
          }
      }
    })
  }

  /**
   * Check if a command has been hypdrated
   */
  protected hydrated: boolean = false

  /**
   * The exit code for the command
   */
  exitCode?: number

  /**
   * The error raised at the time of the executing the command.
   * The value is undefined if no error is raised.
   */
  error?: any

  /**
   * The result property stores the return value of the "run"
   * method (unless commands sets it explicitly)
   */
  result?: any

  /**
   * Logger to log messages
   */
  get logger() {
    return this.ui.logger
  }

  /**
   * Add colors to console messages
   */
  get colors() {
    return this.ui.colors
  }

  /**
   * Is the current command the main command executed from the
   * CLI
   */
  get isMain(): boolean {
    return this.kernel.getMainCommand() === this
  }

  /**
   * Reference to the command name
   */
  get commandName() {
    return (this.constructor as typeof BaseCommand).commandName
  }

  /**
   * Reference to the command options
   */
  get options() {
    return (this.constructor as typeof BaseCommand).options
  }

  /**
   * Reference to the command args
   */
  get args() {
    return (this.constructor as typeof BaseCommand).args
  }

  /**
   * Reference to the command flags
   */
  get flags() {
    return (this.constructor as typeof BaseCommand).flags
  }

  constructor(
    protected kernel: Kernel<any>,
    protected parsed: ParsedOutput,
    public ui: UIPrimitives,
    public prompt: Prompt
  ) {
    super()
  }

  /**
   * Hydrate command by setting class properties from
   * the parsed output
   */
  hydrate() {
    if (this.hydrated) {
      return
    }

    const CommandConstructor = this.constructor as typeof BaseCommand

    /**
     * Set args as properties on the command instance
     */
    CommandConstructor.args.forEach((arg, index) => {
      Object.defineProperty(this, arg.name, {
        value: this.parsed.args[index],
        enumerable: true,
        writable: true,
        configurable: true,
      })
    })

    /**
     * Set flags as properties on the command instance
     */
    CommandConstructor.flags.forEach((flag) => {
      Object.defineProperty(this, flag.name, {
        value: this.parsed.flags[flag.flagName],
        enumerable: true,
        writable: true,
        configurable: true,
      })
    })

    this.hydrated = true
  }

  /**
   * The run method should include the implementation for the
   * command.
   */
  async run(..._: any[]): Promise<any> {}

  /**
   * Executes the commands by running the command's run method.
   */
  async exec() {
    this.hydrate()

    try {
      this.result = await this.run()
      this.exitCode = this.exitCode ?? 0
      return this.result
    } catch (error) {
      this.error = error
      this.exitCode = this.exitCode ?? 1
      throw error
    }
  }

  /**
   * JSON representation of the command
   */
  toJSON() {
    return {
      commandName: (this.constructor as typeof BaseCommand).commandName,
      options: (this.constructor as typeof BaseCommand).options,
      args: this.parsed.args,
      flags: this.parsed.flags,
      error: this.error,
      result: this.result,
      exitCode: this.exitCode,
    }
  }

  /**
   * Assert the command exists with a given exit code
   */
  assertExitCode(code: number) {
    if (this.exitCode !== code) {
      const error = new AssertionError({
        message: `Expected '${this.commandName}' command to finish with exit code '${code}'`,
        actual: this.exitCode,
        expected: code,
        operator: 'strictEqual',
        stackStartFn: this.assertExitCode,
      })
      Object.defineProperty(error, 'showDiff', { value: true })

      throw error
    }
  }

  /**
   * Assert the command exists with a given exit code
   */
  assertNotExitCode(code: number) {
    if (this.exitCode === code) {
      throw new AssertionError({
        message: `Expected '${this.commandName}' command to finish without exit code '${this.exitCode}'`,
        stackStartFn: this.assertNotExitCode,
      })
    }
  }

  /**
   * Assert the command exists with zero exit code
   */
  assertSucceeded() {
    return this.assertExitCode(0)
  }

  /**
   * Assert the command exists with non-zero exit code
   */
  assertFailed() {
    return this.assertNotExitCode(0)
  }

  /**
   * Assert command to log the expected message
   */
  assertLog(message: string, stream?: 'stdout' | 'stderr') {
    const logs = this.logger.getLogs()
    const logMessages = logs.map((log) => log.message)
    const matchingLog = logs.find((log) => log.message === message)

    /**
     * No log found
     */
    if (!matchingLog) {
      const error = new AssertionError({
        message: `Expected log messages to include ${inspect(message)}`,
        actual: logMessages,
        expected: [message],
        operator: 'strictEqual',
        stackStartFn: this.assertLog,
      })
      Object.defineProperty(error, 'showDiff', { value: true })

      throw error
    }

    /**
     * Log is on a different stream
     */
    if (stream && matchingLog.stream !== stream) {
      const error = new AssertionError({
        message: `Expected log message stream to be ${inspect(stream)}, instead received ${inspect(
          matchingLog.stream
        )}`,
        actual: matchingLog.stream,
        expected: stream,
        operator: 'strictEqual',
        stackStartFn: this.assertLog,
      })
      Object.defineProperty(error, 'showDiff', { value: true })

      throw error
    }
  }

  /**
   * Assert command to log the expected message
   */
  assertLogMatches(matchingRegex: RegExp, stream?: 'stdout' | 'stderr') {
    const logs = this.logger.getLogs()
    const matchingLog = logs.find((log) => matchingRegex.test(log.message))

    /**
     * No log found
     */
    if (!matchingLog) {
      const error = new AssertionError({
        message: `Expected log messages to match ${inspect(matchingRegex)}`,
        stackStartFn: this.assertLogMatches,
      })
      throw error
    }

    /**
     * Log is on a different stream
     */
    if (stream && matchingLog.stream !== stream) {
      const error = new AssertionError({
        message: `Expected log message stream to be ${inspect(stream)}, instead received ${inspect(
          matchingLog.stream
        )}`,
        actual: matchingLog.stream,
        expected: stream,
        operator: 'strictEqual',
        stackStartFn: this.assertLogMatches,
      })
      Object.defineProperty(error, 'showDiff', { value: true })

      throw error
    }
  }

  /**
   * Assert the command prints a table to stdout
   */
  assertTableRows(rows: string[][]) {
    const logs = this.logger.getLogs()
    const hasAllMatchingRows = rows.every((row) => {
      const columnsContent = row.join('|')
      return !!logs.find((log) => log.message === columnsContent)
    })

    if (!hasAllMatchingRows) {
      const error = new AssertionError({
        message: `Expected log messages to include a table with the expected rows`,
        operator: 'strictEqual',
        stackStartFn: this.assertTableRows,
      })
      Object.defineProperty(error, 'showDiff', { value: true })

      throw error
    }
  }
}
