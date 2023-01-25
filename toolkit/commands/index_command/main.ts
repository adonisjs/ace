/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { args, BaseCommand, FsLoader } from '../../../index.js'

export class IndexCommand extends BaseCommand {
  static commandName: string = 'index'
  static description: string =
    'Generate JSON index and module loader for commands from a given directory'

  @args.string({ description: 'Path to the commands directory. Should be relative from "cwd"' })
  commandsDir!: string

  async run(): Promise<any> {
    const loader = new FsLoader(join(process.cwd(), this.commandsDir))
    const commandsMetaData = await loader.getMetaData()
    JSON.stringify(commandsMetaData)
  }
}
