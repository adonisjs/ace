/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { BaseCommand } from '../commands/base.ts'
import type { ArrayFlag, NumberFlag, StringFlag, BooleanFlag } from '../types.ts'

/**
 * Namespace for defining flags using decorators.
 *
 * Flags are named options that commands can accept from the CLI.
 * They can be passed using --flag-name or -alias syntax and are
 * made available as properties on the command instance.
 *
 * @example
 * ```ts
 * export class MakeCommand extends BaseCommand {
 *   @flags.boolean({ description: 'Skip confirmation prompts' })
 *   declare force: boolean
 *
 *   @flags.string({ description: 'Database connection', alias: 'c' })
 *   declare connection?: string
 *
 *   @flags.array({ description: 'Additional tags' })
 *   declare tags?: string[]
 * }
 * ```
 */
export const flags = {
  /**
   * Define flag that accepts a string value
   *
   * @param options - Configuration options for the string flag
   *
   * @example
   * ```ts
   * export class MakeCommand extends BaseCommand {
   *   @flags.string({ description: 'Database connection name', alias: 'c' })
   *   declare connection?: string
   *
   *   @flags.string({ description: 'Template name', required: true, default: 'default' })
   *   declare template: string
   * }
   * // Usage: node ace make --connection=mysql --template=api
   * // Usage: node ace make -c mysql --template=api
   * ```
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
   * Define flag that accepts a boolean value
   *
   * Boolean flags don't require a value - their presence indicates true.
   * They can optionally support negated variants with --no-flag-name.
   *
   * @param options - Configuration options for the boolean flag
   *
   * @example
   * ```ts
   * export class MigrateCommand extends BaseCommand {
   *   @flags.boolean({ description: 'Skip confirmation prompts', alias: 'f' })
   *   declare force: boolean
   *
   *   @flags.boolean({ description: 'Run in dry mode', showNegatedVariantInHelp: true })
   *   declare dryRun: boolean
   * }
   * // Usage: node ace migrate --force
   * // Usage: node ace migrate -f
   * // Usage: node ace migrate --dry-run or --no-dry-run
   * ```
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
   * Define flag that accepts a numeric value
   *
   * @param options - Configuration options for the number flag
   *
   * @example
   * ```ts
   * export class ServeCommand extends BaseCommand {
   *   @flags.number({ description: 'Port number', alias: 'p', default: 3000 })
   *   declare port: number
   *
   *   @flags.number({ description: 'Number of workers', required: false })
   *   declare workers?: number
   * }
   * // Usage: node ace serve --port=8080
   * // Usage: node ace serve -p 8080 --workers=4
   * ```
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
   * Define flag that accepts an array of values
   *
   * Array flags can be specified multiple times to build up an array of values.
   *
   * @param options - Configuration options for the array flag
   *
   * @example
   * ```ts
   * export class BuildCommand extends BaseCommand {
   *   @flags.array({ description: 'Include additional files' })
   *   declare include?: string[]
   *
   *   @flags.array({ description: 'Environment variables', alias: 'e' })
   *   declare env?: string[]
   * }
   * // Usage: node ace build --include=*.js --include=*.css
   * // Usage: node ace build -e NODE_ENV=production -e DEBUG=false
   * // Results: include = ['*.js', '*.css'], env = ['NODE_ENV=production', 'DEBUG=false']
   * ```
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
