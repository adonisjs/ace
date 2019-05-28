/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { CommandFlag } from '../Contracts'

type DecoratorFlag = Partial<Pick<CommandFlag, Exclude<keyof CommandFlag, 'type'>>>

function addFlag (target: any, propertyKey: string, options: DecoratorFlag) {
  target.constructor.flags = target.constructor.flags || []
  target.constructor.flags.push(Object.assign({
    name: propertyKey,
  }, options))
}

export const flags = {
  string (options?: DecoratorFlag) {
    return function flagStringDecorator (target: any, propertyKey: string) {
      addFlag(target, propertyKey, Object.assign({ type: 'string' }, options))
    }
  },

  boolean (options?: DecoratorFlag) {
    return function flagStringDecorator (target: any, propertyKey: string) {
      addFlag(target, propertyKey, Object.assign({ type: 'boolean' }, options))
    }
  },

  array (options?: DecoratorFlag) {
    return function flagStringDecorator (target: any, propertyKey: string) {
      addFlag(target, propertyKey, Object.assign({ type: 'array' }, options))
    }
  },
}
