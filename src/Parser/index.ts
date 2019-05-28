/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as getopts from 'getopts'
import { CommandFlag, GlobalFlagHandler, CommandConstructorContract } from '../Contracts'

/**
 * The job of the parser is to parse the command line values by taking
 * the command `args`, `flags` and `globalFlags` into account.
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
   * Parses argv and executes the command and global flags handlers
   */
  public parse (argv: string[], command?: CommandConstructorContract): getopts.ParsedOptions {
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
    return getopts(argv, options)
  }
}
