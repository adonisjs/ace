/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { BaseCommand } from '../../index.js'

export class GenerateManifestCommand extends BaseCommand {
  static commandName: string = 'generate:manifest'
  static description: string = 'Generate a manifest JSO'
}
