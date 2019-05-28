/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { CommandArg } from '../Contracts'

export function arg (options?: Partial<CommandArg>) {
  options = Object.assign({ required: true }, options)
  return function argDecorator (target: any, propertyKey: string) {
    target.constructor.args = target.constructor.args || []
    target.constructor.args.push({
      name: options!.name || propertyKey,
      description: options!.description,
      required: options!.required,
    })
  }
}
