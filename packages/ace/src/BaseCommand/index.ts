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
  public static args: CommandArg[] = []
  public static flags: CommandFlag[] = []
  public static commandName: string = ''

  public parsed?: ParsedOptions
  public async handle () {
  }
}
