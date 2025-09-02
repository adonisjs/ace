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
import type { Colors } from '@poppinss/cliui/types'
import { defineStaticProperty } from '@poppinss/utils'
import { InvalidArgumentsException } from '@poppinss/utils/exception'

import debug from '../debug.ts'
import * as errors from '../errors.ts'
import type { Kernel } from '../kernel.ts'
import type {
  Flag,
  Argument,
  ParsedOutput,
  UIPrimitives,
  CommandOptions,
  CommandMetaData,
  FlagsParserOptions,
  ArgumentsParserOptions,
} from '../types.ts'

/**
 * The base command sets the foundation for defining ace commands.
 * Every command should inherit from the base command.
 *
 * @example
 * ```ts
 * export class MyCommand extends BaseCommand {
 *   static commandName = 'my:command'
 *   static description = 'My custom command'
 *
 *   async run() {
 *     this.logger.info('Hello from my command!')
 *   }
 * }
 * ```
 */
export class BaseCommand extends Macroable {
  /**
   * Whether the command class has been booted
   */
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
   *
   * @example
   * ```ts
   * MyCommand.boot()
   * ```
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
   * @param name - The name of the argument
   * @param options - Configuration options for the argument
   *
   * @example
   * ```ts
   * Command.defineArgument('entity', { type: 'string' })
   * Command.defineArgument('files', { type: 'spread', required: false })
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
   * @param name - The name of the flag
   * @param options - Configuration options for the flag
   *
   * @example
   * ```ts
   * Command.defineFlag('connection', { type: 'string', required: true })
   * Command.defineFlag('force', { type: 'boolean' })
   * Command.defineFlag('tags', { type: 'array' })
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
   *
   * @param options - Optional parser options to merge
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
   *
   * @example
   * ```ts
   * const metadata = MyCommand.serialize()
   * console.log(metadata.commandName) // 'my:command'
   * ```
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
   * Validate the yargs parsed output against the command.
   *
   * @param parsedOutput - The parsed CLI input to validate
   *
   * @example
   * ```ts
   * const parsed = { args: ['value'], flags: { force: true }, unknownFlags: [] }
   * MyCommand.validate(parsed)
   * ```
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
   * Check if a command has been hydrated
   */
  protected hydrated: boolean = false

  /**
   * The exit code for the command
   */
  exitCode?: number

  /**
   * The error raised at the time of executing the command.
   * The value is undefined if no error is raised.
   */
  error?: any

  /**
   * The result property stores the return value of the "run"
   * method (unless command sets it explicitly)
   */
  result?: any

  /**
   * Logger to log messages
   *
   * @example
   * ```ts
   * this.logger.info('Command executed successfully')
   * this.logger.error('Something went wrong')
   * ```
   */
  get logger() {
    return this.ui.logger
  }

  /**
   * Add colors to console messages
   *
   * @example
   * ```ts
   * this.logger.info(this.colors.green('Success!'))
   * this.logger.error(this.colors.red('Error!'))
   * ```
   */
  get colors(): Colors {
    return this.ui.colors
  }

  /**
   * Is the current command the main command executed from the CLI
   *
   * @example
   * ```ts
   * if (this.isMain) {
   *   this.logger.info('This is the main command')
   * }
   * ```
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

  /**
   * Create a new base command instance
   *
   * @param kernel - The Ace kernel instance
   * @param parsed - The parsed CLI input
   * @param ui - UI primitives for output
   * @param prompt - Prompt utilities for user interaction
   */
  constructor(
    protected kernel: Kernel<any>,
    protected parsed: ParsedOutput,
    public ui: UIPrimitives,
    public prompt: Prompt
  ) {
    super()
  }

  /**
   * Hydrate command by setting class properties from the parsed output
   *
   * @example
   * ```ts
   * command.hydrate()
   * console.log(command.name) // Argument value
   * console.log(command.force) // Flag value
   * ```
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
   * The run method should include the implementation for the command.
   *
   * @param _ - Additional arguments (not used in base implementation)
   *
   * @example
   * ```ts
   * async run() {
   *   this.logger.info('Running my command')
   *   return 'Command completed'
   * }
   * ```
   */
  async run(..._: any[]): Promise<any> {}

  /**
   * Executes the command by running the command's run method.
   *
   * @example
   * ```ts
   * const result = await command.exec()
   * console.log('Exit code:', command.exitCode)
   * ```
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
   *
   * @example
   * ```ts
   * const json = command.toJSON()
   * console.log(json.commandName, json.exitCode)
   * ```
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
   * Assert the command exits with a given exit code
   *
   * @param code - The expected exit code
   *
   * @example
   * ```ts
   * command.assertExitCode(0) // Assert successful execution
   * command.assertExitCode(1) // Assert failure
   * ```
   */
  assertExitCode(code: number) {
    if (this.exitCode !== code) {
      throw new AssertionError({
        message: `Expected '${this.commandName}' command to finish with exit code '${code}'`,
        actual: this.exitCode,
        expected: code,
        operator: 'strictEqual',
        stackStartFn: this.assertExitCode,
      })
    }
  }

  /**
   * Assert the command does not exit with a given exit code
   *
   * @param code - The exit code that should not be used
   *
   * @example
   * ```ts
   * command.assertNotExitCode(1) // Assert no failure
   * ```
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
   * Assert the command exits with zero exit code
   *
   * @example
   * ```ts
   * command.assertSucceeded() // Assert success
   * ```
   */
  assertSucceeded() {
    return this.assertExitCode(0)
  }

  /**
   * Assert the command exits with non-zero exit code
   *
   * @example
   * ```ts
   * command.assertFailed() // Assert failure
   * ```
   */
  assertFailed() {
    return this.assertNotExitCode(0)
  }

  /**
   * Assert command logs the expected message
   *
   * @param message - The expected log message
   * @param stream - Optional stream to check ('stdout' or 'stderr')
   *
   * @example
   * ```ts
   * command.assertLog('Command executed successfully')
   * command.assertLog('Error occurred', 'stderr')
   * ```
   */
  assertLog(message: string, stream?: 'stdout' | 'stderr') {
    const logs = this.logger.getLogs()
    const logMessages = logs.map((log) => log.message)
    const matchingLog = logs.find((log) => log.message === message)

    /**
     * No log found
     */
    if (!matchingLog) {
      throw new AssertionError({
        message: `Expected log messages to include ${inspect(message)}`,
        actual: logMessages,
        expected: [message],
        operator: 'strictEqual',
        stackStartFn: this.assertLog,
      })
    }

    /**
     * Log is on a different stream
     */
    if (stream && matchingLog.stream !== stream) {
      throw new AssertionError({
        message: `Expected log message stream to be ${inspect(stream)}, instead received ${inspect(
          matchingLog.stream
        )}`,
        actual: matchingLog.stream,
        expected: stream,
        operator: 'strictEqual',
        stackStartFn: this.assertLog,
      })
    }
  }

  /**
   * Assert command logs a message matching the given regex
   *
   * @param matchingRegex - The regex pattern to match against log messages
   * @param stream - Optional stream to check ('stdout' or 'stderr')
   *
   * @example
   * ```ts
   * command.assertLogMatches(/^Command.*completed$/)
   * command.assertLogMatches(/error/i, 'stderr')
   * ```
   */
  assertLogMatches(matchingRegex: RegExp, stream?: 'stdout' | 'stderr') {
    const logs = this.logger.getLogs()
    const matchingLog = logs.find((log) => matchingRegex.test(log.message))

    /**
     * No log found
     */
    if (!matchingLog) {
      throw new AssertionError({
        message: `Expected log messages to match ${inspect(matchingRegex)}`,
        stackStartFn: this.assertLogMatches,
      })
    }

    /**
     * Log is on a different stream
     */
    if (stream && matchingLog.stream !== stream) {
      throw new AssertionError({
        message: `Expected log message stream to be ${inspect(stream)}, instead received ${inspect(
          matchingLog.stream
        )}`,
        actual: matchingLog.stream,
        expected: stream,
        operator: 'strictEqual',
        stackStartFn: this.assertLogMatches,
      })
    }
  }

  /**
   * Assert the command prints a table with the expected rows to stdout
   *
   * @param rows - The expected table rows as arrays of strings
   *
   * @example
   * ```ts
   * command.assertTableRows([
   *   ['Name', 'Age'],
   *   ['John', '25'],
   *   ['Jane', '30']
   * ])
   * ```
   */
  assertTableRows(rows: string[][]) {
    const logs = this.logger.getLogs()
    const hasAllMatchingRows = rows.every((row) => {
      const columnsContent = row.join('|')
      return !!logs.find((log) => log.message === columnsContent)
    })

    if (!hasAllMatchingRows) {
      throw new AssertionError({
        message: `Expected log messages to include a table with the expected rows`,
        operator: 'strictEqual',
        stackStartFn: this.assertTableRows,
      })
    }
  }
}
