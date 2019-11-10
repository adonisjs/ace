/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import paramCase from 'param-case'
import { ParsedOptions } from 'getopts'
import { Logger } from '@poppinss/fancy-logs'
import { Colors, FakeColors } from '@poppinss/colors'
import { Prompt, FakePrompt } from '@poppinss/prompts'

import { Generator } from '../Generator'
import { CommandContract, CommandArg, CommandFlag } from '../Contracts'

/**
 * Abstract base class other classes must extend
 */
export abstract class BaseCommand implements CommandContract {
  /**
   * When set to true, the command will collect the output of [[this.colors]]
   * and [[this.log]] in memory, instead of printing them to the console.
   */
  constructor (public rawMode: boolean = false) {
  }

  /**
   * Command arguments
   */
  public static args: CommandArg[]

  /**
   * Command flags
   */
  public static flags: CommandFlag[]

  /**
   * Command name
   */
  public static commandName: string

  /**
   * The description of the command displayed on the help screen.
   * Please do not create commands without description
   */
  public static description: string

  /**
   * Any settings a command wants to have. Helpful for third party
   * tools to read the settings in lifecycle hooks and make
   * certain decisions
   */
  public static settings: any

  /**
   * Boots the command by defining required static properties
   */
  public static boot () {
    if (this.booted) {
      return
    }

    this.booted = true
    Object.defineProperty(this, 'args', { value: [] })
    Object.defineProperty(this, 'flags', { value: [] })

    if (!this.hasOwnProperty('settings')) {
      Object.defineProperty(this, 'settings', { value: {} })
    }

    if (!this.hasOwnProperty('commandName')) {
      Object.defineProperty(this, 'commandName', { value: '' })
    }

    if (!this.hasOwnProperty('description')) {
      Object.defineProperty(this, 'description', { value: '' })
    }
  }

  /**
   * Add a new argument to the list of command arguments
   */
  public static $defineArgument (options: Partial<CommandArg>) {
    if (!options.propertyName) {
      throw new Error('"propertyName" is required to register command argument')
    }

    const arg: CommandArg = Object.assign({
      type: options.type || 'string',
      propertyName: options.propertyName,
      name: options.name || options.propertyName,
      required: options.required === false ? false : true,
    }, options)

    this.args.push(arg)
  }

  /**
   * Add a new flag to the list of command flags
   */
  public static $defineFlag (options: Partial<CommandFlag>) {
    if (!options.propertyName) {
      throw new Error('"propertyName" is required to register command flag')
    }

    const flag: CommandFlag = Object.assign({
      name: options.name || paramCase(options.propertyName),
      propertyName: options.propertyName,
      type: options.type || 'boolean',
    }, options)

    this.flags.push(flag)
  }

  /**
   * Whether or not the command has been booted
   */
  public static booted: boolean

  /**
   * Parsed options on the command. They only exist when the command
   * is executed via kernel
   */
  public parsed?: ParsedOptions

  /**
   * The prompt for the command
   */
  public prompt: Prompt | FakePrompt = this.rawMode ? new FakePrompt() : new Prompt()

  /**
   * Returns the instance of logger to log messages
   */
  public logger = new Logger({ fake: this.rawMode })

  /**
   * Generator instance to generate entity files
   */
  public generator = new Generator()

  /**
   * Returns a new instance of colors class. if `[[this.rawMode]]`
   * is set to true, then it will return an instance of [[Stringify]]
   * which has consistent output tailored for testing, otherwise
   * an instance of [[Kleur]] is returned.
   */
  public get colors (): Colors {
    return (this.rawMode ? new FakeColors() : new Colors()) as Colors
  }

  /**
   * Must be defined by the parent class
   */
  public async abstract handle (...args: any[]): Promise<void>
}
