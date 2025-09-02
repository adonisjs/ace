/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { BaseCommand } from '../commands/base.ts'
import type { SpreadArgument, StringArgument } from '../types.ts'

/**
 * Namespace for defining arguments using decorators.
 */
export const args = {
  /**
   * Define argument that accepts a string value
   */
  string<Type = string>(options?: Partial<Omit<StringArgument<Type>, 'type'>>) {
    return function addArg<Key extends string, Target extends { [K in Key]?: Type }>(
      target: Target,
      propertyName: Key
    ) {
      const Command = target.constructor as typeof BaseCommand
      Command.defineArgument(propertyName, { ...options, type: 'string' })
    }
  },

  /**
   * Define argument that accepts a spread value
   */
  spread<Type extends any = string[]>(options?: Partial<Omit<SpreadArgument<Type>, 'type'>>) {
    return function addArg<Key extends string, Target extends { [K in Key]?: Type }>(
      target: Target,
      propertyName: Key
    ) {
      const Command = target.constructor as typeof BaseCommand
      Command.defineArgument(propertyName, { ...options, type: 'spread' })
    }
  },
}
