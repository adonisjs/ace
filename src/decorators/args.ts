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
 *
 * Arguments are positional parameters that commands accept from the CLI.
 * They are parsed in the order they are defined and made available as
 * properties on the command instance.
 *
 * @example
 * ```ts
 * export class MakeCommand extends BaseCommand {
 *   @args.string({ description: 'Entity name' })
 *   declare name: string
 *
 *   @args.spread({ description: 'Additional files', required: false })
 *   declare files?: string[]
 * }
 * ```
 */
export const args = {
  /**
   * Define argument that accepts a string value
   *
   * @param options - Configuration options for the string argument
   *
   * @example
   * ```ts
   * export class MakeCommand extends BaseCommand {
   *   @args.string({ description: 'The entity name' })
   *   declare name: string
   *
   *   @args.string({ description: 'Template type', required: false, default: 'default' })
   *   declare template?: string
   * }
   * ```
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
   * Define argument that accepts a spread of values (variable number of arguments)
   *
   * Spread arguments collect all remaining positional arguments into an array.
   * Only one spread argument is allowed per command and it must be the last argument.
   *
   * @param options - Configuration options for the spread argument
   *
   * @example
   * ```ts
   * export class InstallCommand extends BaseCommand {
   *   @args.string({ description: 'Package manager' })
   *   declare manager: string
   *
   *   @args.spread({ description: 'Package names to install', required: false })
   *   declare packages?: string[]
   * }
   * // Usage: node ace install npm lodash axios moment
   * // manager = 'npm', packages = ['lodash', 'axios', 'moment']
   * ```
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
