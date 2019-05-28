/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/
import { Parser } from '../Parser'
import {
  CommandConstructorContract,
  CommandFlag,
  GlobalFlagHandler,
  CommandArg,
} from '../Contracts'

import * as getopts from 'getopts'

/**
 * Ace kernel class is used to register, find and invoke commands by
 * parsing `process.argv.splice(2)` value.
 */
export class Kernel {
  /**
   * List of registered commands
   */
  public commands: { [name: string]: CommandConstructorContract } = {}

  /**
   * List of registered flags
   */
  public flags: { [name: string]: CommandFlag & { handler: GlobalFlagHandler } } = {}

  /**
   * Since arguments are matched based on their position, we need to make
   * sure that the command author doesn't put optional args before the
   * required args.
   *
   * The concept is similar to Javascript function arguments, you cannot have a
   * required argument after an optional argument.
   */
  private _validateArgs (command: CommandConstructorContract) {
    let optionalArg: CommandArg
    command.args.forEach((arg) => {
      if (optionalArg && arg.required) {
        throw new Error(`Required argument {${arg.name}} cannot come after optional argument {${optionalArg.name}}`)
      }

      if (!arg.required) {
        optionalArg = arg
      }
    })
  }

  /**
   * Casting runtime flag value to the expected flag value of
   * the command. Currently, we just need to normalize
   * arrays.
   */
  private _castFlagValue (flag: CommandFlag, value: any): any {
    return flag.type === 'array' && !Array.isArray(value) ? [value] : value
  }

  /**
   * Validates the runtime command line arguments to ensure they satisfy
   * the length of required arguments for a given command.
   */
  private _validateRuntimeArgs (args: string[], command: CommandConstructorContract) {
    const requiredArgs = command!.args.filter((arg) => arg.required)
    if (args.length < requiredArgs.length) {
      throw new Error(`Missing value for ${requiredArgs[args.length].name} argument`)
    }
  }

  /**
   * Executing global flag handlers. The global flag handlers are
   * not async as of now, but later we can look into making them
   * async.
   */
  private _executeGlobalFlagsHandlers (
    options: getopts.ParsedOptions,
    command?: CommandConstructorContract,
  ) {
    const globalFlags = Object.keys(this.flags)

    globalFlags.forEach((name) => {
      if (options[name] || options[name] === false) {
        const value = this._castFlagValue(this.flags[name], options[name])
        this.flags[name].handler(value, options, command)
      }
    })
  }

  /**
   * Register an array of commands
   */
  public register (commands: CommandConstructorContract[]): this {
    commands.forEach((command) => {
      this._validateArgs(command)
      this.commands[command.commandName] = command
    })

    return this
  }

  /**
   * Returns an array of command names suggestions for a given name.
   */
  public getSuggestions (name: string, distance = 3): string[] {
    const levenshtein = require('fast-levenshtein')
    return Object.keys(this.commands).filter((commandName) => {
      return levenshtein.get(name, commandName) <= distance
    })
  }

  /**
   * Register a global flag to be set on any command. The flag callback is
   * executed before executing the registered command.
   */
  public flag (
    name: string,
    handler: GlobalFlagHandler,
    options: Partial<Pick<CommandFlag, Exclude<keyof CommandFlag, 'name'>>>,
  ): this {
    this.flags[name] = Object.assign({ name, handler, type: 'boolean' }, options)
    return this
  }

  /**
   * Finds the command from the command line argv array. If command for
   * the given name doesn't exists, then it will return `null`.
   */
  public find (argv: string[]): CommandConstructorContract | null {
    /**
     * Even though in `Unix` the command name may appear in between or at last, with
     * ace we always want the command name to be the first argument. However, the
     * arguments to the command itself can appear in any sequence. For example:
     *
     * Works
     *    - node ace make:controller foo
     *    - node ace make:controller --http foo
     *
     * Doesn't work
     *    - node ace foo make:controller
     */
    return this.commands[argv[0]] || null
  }

  /**
   * Makes instance of a given command by processing command line arguments
   * and setting them on the command instance
   */
  public async handle (argv: string[]) {
    if (!argv.length) {
      return
    }

    const hasMentionedCommand = !argv[0].startsWith('-')
    const parser = new Parser(this.flags)

    /**
     * Parse flags when no command is defined
     */
    if (!hasMentionedCommand) {
      const parsedOptions = parser.parse(argv)
      this._executeGlobalFlagsHandlers(parsedOptions)
      return
    }

    /**
     * If command doesn't exists, then raise an error for same
     */
    const command = this.find(argv)
    if (!command) {
      throw new Error(`${argv[0]} is not a registered command`)
    }

    /**
     * Parse argv and execute the `handle` method.
     */
    const parsedOptions = parser.parse(argv.splice(1), command)
    this._executeGlobalFlagsHandlers(parsedOptions, command)

    /**
     * Ensure that the runtime arguments satisfies the command
     * arguments requirements.
     */
    this._validateRuntimeArgs(parsedOptions._, command)

    /**
     * Creating a new command instance and setting
     * parsed options on it.
     */
    const commandInstance = new command()
    commandInstance.parsed = parsedOptions

    /**
     * Setup command instance argument and flag
     * properties.
     */
    command.args.forEach((arg, index) => {
      commandInstance[arg.name] = parsedOptions._[index]
    })

    command.flags.forEach((flag) => {
      commandInstance[flag.name] = this._castFlagValue(flag, parsedOptions[flag.name])
    })

    /**
     * Finally calling the `handle` method. The consumer consuming the
     * `Kernel` must handle the command errors.
     */
    return commandInstance.handle()
  }
}
