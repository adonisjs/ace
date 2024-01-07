/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { BaseCommand } from '../commands/base.js'
import type { ArrayFlag, NumberFlag, StringFlag, BooleanFlag } from '../types.js'

/**
 * Namespace for defining flags using decorators.
 */
export const flags = {
  /**
   * Define option that accepts a string value
   */
  string<Type = string>(options?: Partial<Omit<StringFlag<Type>, 'type'>>) {
    return function addArg<Key extends string, Target extends { [K in Key]?: Type }>(
      target: Target,
      propertyName: Key
    ) {
      const Command = target.constructor as typeof BaseCommand
      Command.defineFlag(propertyName, { type: 'string', ...options })
    }
  },

  /**
   * Define option that accepts a boolean value
   */
  boolean<Type = boolean>(options?: Partial<Omit<BooleanFlag<Type>, 'type'>>) {
    return function addArg<Key extends string, Target extends { [K in Key]?: Type }>(
      target: Target,
      propertyName: Key
    ) {
      const Command = target.constructor as typeof BaseCommand
      Command.defineFlag(propertyName, { type: 'boolean', ...options })
    }
  },

  /**
   * Define option that accepts a number value
   */
  number<Type = number>(options?: Partial<Omit<NumberFlag<Type>, 'type'>>) {
    return function addArg<Key extends string, Target extends { [K in Key]?: Type }>(
      target: Target,
      propertyName: Key
    ) {
      const Command = target.constructor as typeof BaseCommand
      Command.defineFlag(propertyName, { type: 'number', ...options })
    }
  },

  /**
   * Define option that accepts an array of values
   */
  array<Type extends any[] = string[]>(options?: Partial<Omit<ArrayFlag<Type>, 'type'>>) {
    return function addArg<Key extends string, Target extends { [K in Key]?: Type }>(
      target: Target,
      propertyName: Key
    ) {
      const Command = target.constructor as typeof BaseCommand
      Command.defineFlag(propertyName, { type: 'array', ...options })
    }
  },
}
