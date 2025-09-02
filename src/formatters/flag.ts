/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
  type ArrayFlag,
  type BooleanFlag,
  type Flag,
  type NumberFlag,
  type StringFlag,
  type UIPrimitives,
} from '../types.ts'

/**
 * The flag formatter formats a flag as per the http://docopt.org/ specification
 *
 * @example
 * ```ts
 * const formatter = new FlagFormatter(flag, colors)
 * const formatted = formatter.formatOption() // '--connection[=CONNECTION]'
 * const description = formatter.formatDescription() // 'Database connection'
 * ```
 */
export class FlagFormatter {
  /**
   * The flag configuration
   */
  #flag: Flag

  /**
   * Color utilities for formatting output
   */
  #colors: UIPrimitives['colors']

  /**
   * Create a new flag formatter
   *
   * @param flag - The flag configuration to format
   * @param colors - Color utilities for output formatting
   */
  constructor(flag: Flag, colors: UIPrimitives['colors']) {
    this.#flag = flag
    this.#colors = colors
  }

  /**
   * Formats the value flag with proper placeholder syntax
   *
   * @param flag - The flag configuration
   * @param valuePlaceholder - The placeholder text for the flag value
   */
  #formatValueFlag(flag: Flag, valuePlaceholder: string) {
    return flag.required ? `=${valuePlaceholder}` : `[=${valuePlaceholder}]`
  }

  /**
   * Formats the aliases for the flag
   *
   * @param flag - The flag configuration
   */
  #formatAliases(flag: Flag): string[] {
    if (!flag.alias) {
      return []
    }

    if (typeof flag.alias === 'string') {
      return [`-${flag.alias}`]
    }

    return flag.alias.map((alias) => `-${alias}`)
  }

  /**
   * Formats the array flag by appending ellipsis and wrapping the value
   *
   * @param flag - The array flag configuration
   */
  #formatArrayFlag(flag: ArrayFlag<string[]>) {
    const value = this.#formatValueFlag(flag, `${flag.flagName.toUpperCase()}...`)
    const aliases = this.#formatAliases(flag)
    const flagWithValue = `--${flag.flagName}${value}`

    if (aliases.length) {
      return `  ${this.#colors.green(`${aliases.join(',')}, ${flagWithValue}`)}  `
    }

    return `  ${this.#colors.green(flagWithValue)}  `
  }

  /**
   * Formats the string flag by wrapping the value to indicate if required
   *
   * @param flag - The string flag configuration
   */
  #formatStringFlag(flag: StringFlag<string>) {
    const value = this.#formatValueFlag(flag, `${flag.flagName.toUpperCase()}`)
    const aliases = this.#formatAliases(flag)
    const flagWithValue = `--${flag.flagName}${value}`

    if (aliases.length) {
      return `  ${this.#colors.green(`${aliases.join(',')}, ${flagWithValue}`)}  `
    }

    return `  ${this.#colors.green(flagWithValue)}  `
  }

  /**
   * Formats the numeric flag by wrapping the value to indicate if required
   *
   * @param flag - The numeric flag configuration
   */
  #formatNumericFlag(flag: NumberFlag<number>) {
    const value = this.#formatValueFlag(flag, `${flag.flagName.toUpperCase()}`)
    const aliases = this.#formatAliases(flag)
    const flagWithValue = `--${flag.flagName}${value}`

    if (aliases.length) {
      return `  ${this.#colors.green(`${aliases.join(',')}, ${flagWithValue}`)}  `
    }

    return `  ${this.#colors.green(flagWithValue)}  `
  }

  /**
   * Formats the boolean flag. Boolean flags need no value wrapping
   *
   * @param flag - The boolean flag configuration
   */
  #formatBooleanFlag(flag: BooleanFlag<boolean>) {
    const aliases = this.#formatAliases(flag)
    const negatedVariant = flag.showNegatedVariantInHelp ? `|--no-${flag.flagName}` : ''
    const flagWithVariant = `--${flag.flagName}${negatedVariant}`

    if (aliases.length) {
      return `  ${this.#colors.green(`${aliases.join(',')}, ${flagWithVariant}`)}  `
    }

    return `  ${this.#colors.green(flagWithVariant)}  `
  }

  /**
   * Returns formatted description for the flag
   *
   * @example
   * ```ts
   * formatter.formatDescription() // 'Database connection [default: mysql]'
   * ```
   */
  formatDescription(): string {
    const defaultValue = this.#flag.default !== undefined ? `[default: ${this.#flag.default}]` : ''
    const separator = defaultValue && this.#flag.description ? ' ' : ''
    return this.#colors.dim(`${this.#flag.description || ''}${separator}${defaultValue}`)
  }

  /**
   * Returns a formatted version of the flag name and aliases
   *
   * @example
   * ```ts
   * formatter.formatOption() // '--connection[=CONNECTION]' or '--force, -f'
   * ```
   */
  formatOption(): string {
    switch (this.#flag.type) {
      case 'array':
        return this.#formatArrayFlag(this.#flag)
      case 'string':
        return this.#formatStringFlag(this.#flag)
      case 'number':
        return this.#formatNumericFlag(this.#flag)
      case 'boolean':
        return this.#formatBooleanFlag(this.#flag)
    }
  }
}
