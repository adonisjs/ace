/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Argument, UIPrimitives } from '../types.js'

/**
 * The argument formatter formats an argument as per the http://docopt.org/ specification.
 */
export class ArgumentFormatter {
  #argument: Argument
  #colors: UIPrimitives['colors']

  constructor(argument: Argument, colors: UIPrimitives['colors']) {
    this.#argument = argument
    this.#colors = colors
  }

  /**
   * Wraps the optional placeholder on option arguments
   */
  #formatArgument(argument: Argument, valuePlaceholder: string) {
    return argument.required ? `${valuePlaceholder}` : `[${valuePlaceholder}]`
  }

  /**
   * Returns formatted description for the argument
   */
  formatDescription(): string {
    const defaultValue = this.#argument.default ? `[default: ${this.#argument.default}]` : ''
    const separator = defaultValue && this.#argument.description ? ' ' : ''
    return this.#colors.dim(`${this.#argument.description || ''}${separator}${defaultValue}`)
  }

  /**
   * Returns a formatted version of the argument name to be displayed
   * inside a list
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
   * Returns a formatted version of the argument name to
   * be displayed next to usage
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
