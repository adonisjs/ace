/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { CommandFlag, FlagTypes, CommandConstructorContract } from '../Contracts'

/**
 * Pushes flag to the list of command flags with predefined
 * types.
 */
function addFlag<T extends any>(
  type: FlagTypes,
  options: Partial<Omit<CommandFlag<T>, 'propertyName' | 'type'>>
) {
  return function flag<TKey extends string, TTarget extends { [K in TKey]: T }>(
    target: TTarget,
    propertyName: TKey
  ) {
    const Command = target.constructor as CommandConstructorContract
    Command.boot()
    Command.$addFlag(Object.assign({ type, propertyName }, options))
  }
}

export const flags = {
  /**
   * Create a flag that excepts string values
   */
  string<T extends any>(options?: Partial<Omit<CommandFlag<T>, 'propertyName' | 'type'>>) {
    return addFlag<T>('string', options || {})
  },

  /**
   * Create a flag that excepts numeric values
   */
  number<T extends any>(options?: Partial<Omit<CommandFlag<T>, 'propertyName' | 'type'>>) {
    return addFlag<T>('number', options || {})
  },

  /**
   * Create a flag that excepts boolean values
   */
  boolean<T extends any>(options?: Partial<Omit<CommandFlag<T>, 'propertyName' | 'type'>>) {
    return addFlag<T>('boolean', options || {})
  },

  /**
   * Create a flag that excepts array of string values
   */
  array<T extends any>(options?: Partial<Omit<CommandFlag<T>, 'propertyName' | 'type'>>) {
    return addFlag<T>('array', options || {})
  },

  /**
   * Create a flag that excepts array of numeric values
   */
  numArray<T extends any>(options?: Partial<Omit<CommandFlag<T>, 'propertyName' | 'type'>>) {
    return addFlag<T>('numArray', options || {})
  },
}
