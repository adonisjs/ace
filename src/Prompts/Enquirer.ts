/**
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as enq from 'enquirer'
import { Prompt } from './Base'

/**
 * Since the typings for `enquirer` package is badly broken, we
 * need to cast it to any to make it usable
 */
const enquirer = enq as any

/**
 * Uses the `enquirer` package to prompt user for input. The `$prompt`
 * method is invoked by the extended `Prompt` class.
 */
export class Enquirer extends Prompt {
  protected async $prompt (options: any): Promise<any> {
    options = Object.assign({ name: 'prompt' }, options)
    const output = await enquirer.prompt(options)
    return output[options.name]
  }
}
