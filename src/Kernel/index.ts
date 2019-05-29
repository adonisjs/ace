/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as getopts from 'getopts'

import { Parser } from '../Parser'
import { validateCommand } from '../utils/validateCommand'
import { CommandConstructorContract, CommandFlag, GlobalFlagHandler } from '../Contracts'

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
      const value = options[name]
      if (value === undefined) {
        return
      }

      if ((typeof (value) === 'string' || Array.isArray(value)) && !value.length) {
        return
      }

      this.flags[name].handler(options[name], options, command)
    })
  }

  /**
   * Register an array of commands
   */
  public register (commands: CommandConstructorContract[]): this {
    commands.forEach((command) => {
      validateCommand(command)
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
   * Run a given command by parsing the command line arguments
   */
  public async runCommand (argv: string[], command: CommandConstructorContract) {
    const parser = new Parser(this.flags)

    /**
     * Parse argv and execute the `handle` method.
     */
    const parsedOptions = parser.parse(argv, command)
    this._executeGlobalFlagsHandlers(parsedOptions, command)

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
    for (let i = 0; i < command.args.length; i++) {
      const arg = command.args[i]
      if (arg.type === 'spread') {
        commandInstance[arg.name] = parsedOptions._.slice(i)
        break
      } else {
        commandInstance[arg.name] = parsedOptions._[i]
      }
    }

    /**
     * Set flag value on the command instance
     */
    command.flags.forEach((flag) => {
      commandInstance[flag.name] = parsedOptions[flag.name]
    })

    /**
     * Finally calling the `handle` method. The consumer consuming the
     * `Kernel` must handle the command errors.
     */
    return commandInstance.handle()
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

    /**
     * Parse flags when no command is defined
     */
    if (!hasMentionedCommand) {
      const parsedOptions = new Parser(this.flags).parse(argv)
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

    return this.runCommand(argv.splice(1), command)
  }
}
