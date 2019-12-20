/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { BaseCommand } from '../BaseCommand'
import { CommandContract } from '../Contracts'

/**
 * The help command for print the help output
 */
export class HelpCommand extends BaseCommand implements CommandContract {
  public static commandName = 'help'
  public static description = 'See help for all the commands'

  public async handle () {
    this.kernel.printHelp()
  }
}
