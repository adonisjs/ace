/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { CommandArg, ArgTypes, CommandConstructorContract } from '../Contracts'

type DecoratorArg = Partial<Pick<CommandArg, Exclude<keyof CommandArg, 'type'>>>

/**
 * Adds arg to the list of command arguments with pre-defined
 * type.
 */
function addArg (type: ArgTypes, options: DecoratorArg) {
  return function arg (target: any, propertyName: string) {
    const Command = target.constructor as CommandConstructorContract
    Command.boot()
    Command.$addArgument(Object.assign({ type, propertyName }, options))
  }
}

export const args = {
  /**
   * Define argument that accepts string value
   */
  string (options?: Partial<CommandArg>) {
    return addArg('string', options || {})
  },

  /**
   * Define argument that accepts multiple values. Must be
   * the last argument.
   */
  spread (options?: Partial<CommandArg>) {
    return addArg('spread', options || {})
  },
}
