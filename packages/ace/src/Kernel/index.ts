/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { CommandConstructorContract, CommandFlag, GlobalFlagHandler } from '../Contracts'
import { Parser } from '../Parser'

/**
 * Ace kernel class is used to register, find and invoke commands by
 * parsing `process.argv.splice(2)` value.
 */
export class Kernel {
  private _commands: { [name: string]: CommandConstructorContract } = {}
  private _flags: { [name: string]: CommandFlag & { handler: GlobalFlagHandler } } = {}

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
   * Register a global flag to be set on any command. The flag callback is
   * executed before executing the registered command.
   */
  public flag (
    name: string,
    handler: GlobalFlagHandler,
    options: Partial<Pick<CommandFlag, Exclude<keyof CommandFlag, 'name'>>>,
  ): this {
    this._flags[name] = Object.assign({ name, handler, type: 'boolean' }, options)
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
  public async handle (argv: string[]) {
    if (!argv.length) {
      return
    }

    const hasMentionedCommand = !argv[0].startsWith('-')
    const parser = new Parser(this._flags)

    /**
     * Parse flags when no command is defined
     */
    if (!hasMentionedCommand) {
      parser.parse(argv)
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
    const commandInstance = parser.parse(argv.splice(1), command)
    return commandInstance.handle()
  }
}
