/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ArrayFlag, BooleanFlag, Flag, NumberFlag, StringFlag, UIPrimitives } from '../types.js'

/**
 * The flag formatter formats a flag as per the http://docopt.org/ specification.
 */
export class FlagFormatter {
  #flag: Flag
  #colors: UIPrimitives['colors']

  constructor(flag: Flag, colors: UIPrimitives['colors']) {
    this.#flag = flag
    this.#colors = colors
  }

  /**
   * Formats the value flag
   */
  #formatValueFlag(flag: Flag, valuePlaceholder: string) {
    return flag.required ? `=${valuePlaceholder}` : `[=${valuePlaceholder}]`
  }

  /**
   * Formats the aliases for the flag
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
   * Formats the array flag by appending ellipsis `...` and wrapping
   * the value to indicate if it is required or not
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
   * Formats the string flag by wrapping the value to indicate
   * if it is required or not
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
   * Formats the numeric flag by wrapping the value to indicate
   * if it is required or not
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
   * Formats the boolean flag. Boolean flags needs no wrapping
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
   */
  formatDescription(): string {
    const defaultValue = this.#flag.default !== undefined ? `[default: ${this.#flag.default}]` : ''
    const separator = defaultValue && this.#flag.description ? ' ' : ''
    return this.#colors.dim(`${this.#flag.description || ''}${separator}${defaultValue}`)
  }

  /**
   * Returns a formatted version of the flag name and aliases
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
