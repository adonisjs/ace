/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as getopts from 'getopts'
import { CommandConstructorContract, CommandContract } from '../Contracts'

/**
 * Ace kernel class is used to register, find and invoke commands by
 * parsing `process.argv` value.
 */
export class Kernel {
  private _commands: { [name: string]: CommandConstructorContract } = {}

  /**
   * Register an array of commands
   */
  public register (commands: CommandConstructorContract[]): this {
    commands.forEach((command) => {
      this._commands[command.commandName] = command
    })

    return this
  }

  /**
   * Finds the command from the command line argv array. If command for
   * the given name doesn't exists, then it will return `null`.
   */
  public find (argv: string[]): CommandConstructorContract | null {
    /**
     * Enen though in `Unix` the command name may appear in between or at last, with
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
    return this._commands[argv[0]] || null
  }

  /**
   * Makes instance of a given command by processing command line arguments
   * and setting them on the command instance
   */
  public make<T extends CommandConstructorContract> (command: T, argv: string[]): CommandContract {
    /**
     * List of arguments that are required
     */
    const requiredArgs = command.args.filter((arg) => arg.required)

    /**
     * Building getopts options by inspecting all flags. Make sure to
     * check `getops` documentation to understand what all options
     * does.
     */
    const options = command.flags.reduce((result: getopts.Options, flag) => {
      /**
       * Register alias (when exists)
       */
      if (flag.alias) {
        result.alias![flag.alias] = flag.name
      }

      /**
       * Register flag as boolean when `flag.type === 'boolean'`
       */
      if (flag.type === 'boolean') {
        result.boolean!.push(flag.name)
      }

      /**
       * Register flag as string when `flag.type === 'string' | 'array'`
       */
      if (['string', 'array'].indexOf(flag.type) > -1) {
        result.string!.push(flag.name)
      }

      /**
       * Set default value when defined on the flag
       */
      if (flag.default !== undefined) {
        result.default![flag.name] = flag.default
      }

      return result
    }, { alias: {}, boolean: [], default: {}, string: [] })

    /**
     * Parsed options via getopts
     */
    const parsed = getopts(argv.slice(1), options)

    /**
     * Raise exception when required arguments are missing
     */
    if (parsed._.length < requiredArgs.length) {
      throw new Error(`Missing value for ${requiredArgs[parsed._.length].name} argument`)
    }

    const commandInstance = new command()

    /**
     * Sharing parsed output with the command
     */
    commandInstance['parsed'] = parsed

    /**
     * Set value for args
     */
    command.args.forEach((arg, index) => {
      commandInstance[arg.name] = parsed._[index]
    })

    /**
     * Set value for flags
     */
    command.flags.forEach((flag) => {
      const value = parsed[flag.name]
      commandInstance[flag.name] = flag.type === 'array' && !Array.isArray(value) ? [value] : value
    })

    return commandInstance
  }

  /**
   * Execute the command instance by parsing `process.argv`
   */
  public async exec (command: CommandConstructorContract, argv: string[]): Promise<CommandContract> {
    const commandInstance = this.make(command, argv)
    await commandInstance.handle()
    return commandInstance
  }
}
