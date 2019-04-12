/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as getopts from 'getopts'
import { CommandFlag, GlobalFlagHandler, CommandConstructorContract, CommandContract } from '../Contracts'

/**
 * Parser parses the argv array and executes the flag global handlers along with
 * the command handler.
 */
export class Parser {
  constructor (
    private _registeredFlags: {[name: string]: CommandFlag & { handler: GlobalFlagHandler }},
  ) {}

    /**
   * Processes ace command flag to set the options for `getopts`.
   */
  private _processFlag (flag: CommandFlag, options: getopts.Options) {
    /**
     * Register alias (when exists)
     */
    if (flag.alias) {
      options.alias![flag.alias] = flag.name
    }

    /**
     * Register flag as boolean when `flag.type === 'boolean'`
     */
    if (flag.type === 'boolean') {
      options.boolean!.push(flag.name)
    }

    /**
     * Register flag as string when `flag.type === 'string' | 'array'`
     */
    if (['string', 'array'].indexOf(flag.type) > -1) {
      options.string!.push(flag.name)
    }

    /**
     * Set default value when defined on the flag
     */
    if (flag.default !== undefined) {
      options.default![flag.name] = flag.default
    }
  }

  /**
   * Casts the flag value to an array, if original type was
   * array and value isn't an array.
   */
  private _castFlag (flag: CommandFlag, value: any): any {
    return flag.type === 'array' && !Array.isArray(value) ? [value] : value
  }

  /**
   * Validates the arguments required by a command.
   */
  private _validateArgs (args: string[], command: CommandConstructorContract) {
    const requiredArgs = command!.args.filter((arg) => arg.required)
    if (args.length < requiredArgs.length) {
      throw new Error(`Missing value for ${requiredArgs[args.length].name} argument`)
    }
  }

  /**
   * Parses argv and executes the command and global flags handlers
   */
  public parse (argv: string[]): void
  public parse (argv: string[], command: CommandConstructorContract): CommandContract
  public parse (argv: string[], command?: CommandConstructorContract): void | CommandContract {
    let options = { alias: {}, boolean: [], default: {}, string: [] }
    const globalFlags = Object.keys(this._registeredFlags)

    /**
     * Build options from global flags
     */
    globalFlags.forEach((name) => this._processFlag(this._registeredFlags[name], options))

    /**
     * Build options from command flags
     */
    if (command) {
      command.flags.forEach((flag) => this._processFlag(flag, options))
    }

    /**
     * Parsing argv with the previously built options
     */
    const parsed = getopts(argv, options)

    /**
     * Loop over global flags and call their handlers when value
     * is defined for that flag. The global handlers are called
     * first and they can `exit` the process (if they want).
     */
    globalFlags.forEach((name) => {
      if (parsed[name] || parsed[name] === false) {
        const value = this._castFlag(this._registeredFlags[name], parsed[name])
        this._registeredFlags[name].handler(value, parsed, command)
      }
    })

    /**
     * Return early if no command exists
     */
    if (!command) {
      return
    }

    this._validateArgs(parsed._, command)

    const commandInstance = new command()
    commandInstance.parsed = parsed

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
      commandInstance[flag.name] = this._castFlag(flag, parsed[flag.name])
    })

    return commandInstance
  }
}
