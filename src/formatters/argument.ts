/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { type Argument, type UIPrimitives } from '../types.ts'

/**
 * The argument formatter formats an argument as per the http://docopt.org/ specification
 *
 * @example
 * ```ts
 * const formatter = new ArgumentFormatter(argument, colors)
 * const formatted = formatter.formatOption() // '<entity>'
 * const listOption = formatter.formatListOption() // '  entity  '
 * ```
 */
export class ArgumentFormatter {
  /**
   * The argument configuration
   */
  #argument: Argument

  /**
   * Color utilities for formatting output
   */
  #colors: UIPrimitives['colors']

  /**
   * Create a new argument formatter
   *
   * @param argument - The argument configuration to format
   * @param colors - Color utilities for output formatting
   */
  constructor(argument: Argument, colors: UIPrimitives['colors']) {
    this.#argument = argument
    this.#colors = colors
  }

  /**
   * Wraps the optional placeholder on option arguments
   *
   * @param argument - The argument configuration
   * @param valuePlaceholder - The placeholder text for the argument value
   */
  #formatArgument(argument: Argument, valuePlaceholder: string) {
    return argument.required ? `${valuePlaceholder}` : `[${valuePlaceholder}]`
  }

  /**
   * Returns formatted description for the argument
   *
   * @example
   * ```ts
   * formatter.formatDescription() // 'The entity name [default: user]'
   * ```
   */
  formatDescription(): string {
    const defaultValue = this.#argument.default ? `[default: ${this.#argument.default}]` : ''
    const separator = defaultValue && this.#argument.description ? ' ' : ''
    return this.#colors.dim(`${this.#argument.description || ''}${separator}${defaultValue}`)
  }

  /**
   * Returns a formatted version of the argument name to be displayed inside a list
   *
   * @example
   * ```ts
   * formatter.formatListOption() // '  entity  ' or '  [entity]  ' for optional
   * ```
   */
  formatListOption(): string {
    switch (this.#argument.type) {
      case 'spread':
        return `  ${this.#colors.green(
          this.#formatArgument(this.#argument, `${this.#argument.argumentName}...`)
        )}  `
      case 'string':
        return `  ${this.#colors.green(
          this.#formatArgument(this.#argument, `${this.#argument.argumentName}`)
        )}  `
    }
  }

  /**
   * Returns a formatted version of the argument name to be displayed next to usage
   *
   * @example
   * ```ts
   * formatter.formatOption() // '<entity>' or '[<entity>]' for optional
   * ```
   */
  formatOption(): string {
    switch (this.#argument.type) {
      case 'spread':
        return this.#colors.dim(
          `${this.#formatArgument(this.#argument, `<${this.#argument.argumentName}...>`)}`
        )
      case 'string':
        return this.#colors.dim(
          `${this.#formatArgument(this.#argument, `<${this.#argument.argumentName}>`)}`
        )
    }
  }
}
