/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { ParsedOptions } from 'getopts'
import { CommandContract, CommandArg, CommandFlag } from '../Contracts'

/**
 * Abstract base class other classes must extend
 */
export abstract class BaseCommand implements CommandContract {
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
   * Parsed options on the command. They only exist when the command
   * is executed via kernel
   */
  public parsed?: ParsedOptions

  public async handle () {
  }
}
