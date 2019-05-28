/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as getopts from 'getopts'
import { CommandFlag, GlobalFlagHandler, CommandConstructorContract, CommandArg } from '../Contracts'
import { InvalidArgumentException } from '../Exceptions/InvalidArgumentException'

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
  private _preProcessFlag (flag: CommandFlag, options: getopts.Options) {
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
   * Casts value of a flag to it's expected data type. These values
   * are then later validated to ensure that casting was successful.
   */
  private _castFlag (flag: CommandFlag, parsed: getopts.ParsedOptions) {
    const value = parsed[flag.name]

    /**
     * Return early when value is undefined or it's type is not an array
     * type
     */
    if (['boolean', 'string', 'number'].indexOf(flag.type) > -1) {
      return
    }

    /**
     * If value is already and array then their is no point
     * of casting them to an array
     */
    if (Array.isArray(value)) {
      return
    }

    /**
     * Parse string as array seperated by comma
     */
    if (flag.type === 'array') {
      parsed[flag.name] = value ? value.split(',') : []
      return
    }

    /**
     * Parse numbers as an array of numbers seperated by comma
     */
    if (flag.type === 'numArray') {
      parsed[flag.name] = value ? (typeof (value) === 'string'
        ? value.split(',').map((one: any) => Number(one))
        : [Number(value)]) : []
    }
  }

  /**
   * Validating the flag to ensure that it's valid as per the
   * desired data type.
   */
  private _validateFlag (flag: CommandFlag, parsed: getopts.ParsedOptions) {
    const value = parsed[flag.name]
    if (value === undefined) {
      return
    }

    if (flag.type === 'string' && typeof (value) !== 'string') {
      throw InvalidArgumentException.invalidType(flag.name, flag.type)
    }

    if (flag.type === 'number' && typeof (value) !== 'number') {
      throw InvalidArgumentException.invalidType(flag.name, flag.type)
    }

    /**
     * Raise error when value is expected to be an array of numbers
     * but one or more values are not numbers or is NAN.
     */
    if (flag.type === 'numArray' && value.findIndex((one: any) => {
      return typeof (one) !== 'number' || isNaN(one)
    }) > -1) {
      throw InvalidArgumentException.invalidType(flag.name, flag.type)
    }
  }

  /**
   * Validates the value to ensure that values are defined for
   * required arguments.
   */
  private _validateArg (arg: CommandArg, index: number, parsed: getopts.ParsedOptions) {
    const value = parsed._[index]

    if (value === undefined && arg.required) {
      throw InvalidArgumentException.missingArgument(arg.name)
    }
  }

  /**
   * Parses argv and executes the command and global flags handlers
   */
  public parse (argv: string[], command?: CommandConstructorContract): getopts.ParsedOptions {
    let options = { alias: {}, boolean: [], default: {}, string: [] }
    const globalFlags = Object.keys(this._registeredFlags).map((name) => this._registeredFlags[name])

    /**
     * Build options from global flags
     */
    globalFlags.forEach((flag) => this._preProcessFlag(flag, options))

    /**
     * Build options from command flags
     */
    if (command) {
      command.flags.forEach((flag) => this._preProcessFlag(flag, options))
    }

    /**
     * Parsing argv with the previously built options
     */
    const parsed = getopts(argv, options)

    /**
     * Validating global flags (if any)
     */
    globalFlags.forEach((flag) => {
      this._castFlag(flag, parsed)
      this._validateFlag(flag, parsed)
    })

    /**
     * Validating command flags (if command is defined)
     */
    if (command) {
      command.flags.forEach((flag) => {
        this._castFlag(flag, parsed)
        this._validateFlag(flag, parsed)
      })

      command.args.forEach((arg, index) => {
        this._validateArg(arg, index, parsed)
      })
    }

    return parsed
  }
}
