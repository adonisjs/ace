/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { ParsedOptions } from 'getopts'
import { Logger } from '@poppinss/fancy-logs'
import { Colors, FakeColors } from '@poppinss/colors'
import { Prompt, FakePrompt } from '@poppinss/prompts'
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
  public static args: CommandArg[] = []

  /**
   * Command flags
   */
  public static flags: CommandFlag[] = []

  /**
   * Command name
   */
  public static commandName: string = ''

  /**
   * The description of the command displayed on the help screen.
   * Please do not create commands without description
   */
  public static description: string = ''

  /**
   * Any settings a command wants to have. Helpful for third party
   * tools to read the settings in lifecycle hooks and make
   * certain decisions
   */
  public static settings: any

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
   * Returns a new instance of colors class. if `[[this.rawMode]]`
   * is set to true, then it will return an instance of [[Stringify]]
   * which has consistent output tailored for testing, otherwise
   * an instance of [[Kleur]] is returned.
   */
  public get colors (): Colors | FakeColors {
    return this.rawMode ? new FakeColors() : new Colors()
  }

  /**
   * Must be defined by the parent class
   */
  public async abstract handle (): Promise<void>
}
