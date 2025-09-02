/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import string from '@poppinss/utils/string'
import { TERMINAL_SIZE, wrap } from '@poppinss/cliui/helpers'

import { ArgumentFormatter } from './argument.ts'
import type { AllowedInfoValues, CommandMetaData, UIPrimitives } from '../types.ts'

/**
 * The command formatter exposes API to format command data for the
 * commands list and the command help
 *
 * @example
 * ```ts
 * const formatter = new CommandFormatter(command, colors)
 * const usage = formatter.formatUsage(['alias'], 'node ace')
 * const description = formatter.formatDescription()
 * ```
 */
export class CommandFormatter {
  /**
   * The command metadata
   */
  #command: CommandMetaData

  /**
   * Color utilities for formatting output
   */
  #colors: UIPrimitives['colors']

  /**
   * Create a new command formatter
   *
   * @param command - The command metadata to format
   * @param colors - Color utilities for output formatting
   */
  constructor(command: CommandMetaData, colors: UIPrimitives['colors']) {
    this.#command = command
    this.#colors = colors
  }

  /**
   * Returns the formatted command name to be displayed in the list of commands
   *
   * @param aliases - Array of command aliases
   *
   * @example
   * ```ts
   * formatter.formatListName(['make']) // '  generate:model (make)  '
   * ```
   */
  formatListName(aliases: string[]) {
    const formattedAliases = aliases.length ? ` ${this.#colors.dim(`(${aliases.join(', ')})`)}` : ''
    return `  ${this.#colors.green(this.#command.commandName)}${formattedAliases}  `
  }

  /**
   * Returns the formatted description of the command
   *
   * @example
   * ```ts
   * formatter.formatDescription() // 'Generate a new model'
   * ```
   */
  formatDescription() {
    return this.#command.description || ''
  }

  /**
   * Returns multiline command help with proper text wrapping
   *
   * @param binaryName - The binary name for interpolation
   * @param terminalWidth - Terminal width for text wrapping
   *
   * @example
   * ```ts
   * formatter.formatHelp('node ace') // Formatted help text
   * ```
   */
  formatHelp(binaryName?: AllowedInfoValues, terminalWidth: number = TERMINAL_SIZE): string {
    const binary = binaryName ? `${binaryName}` : ''
    if (!this.#command.help) {
      return ''
    }

    /**
     * Normalize help text to be an array of rows
     */
    const help = Array.isArray(this.#command.help) ? this.#command.help : [this.#command.help]

    /**
     * Wrap text when goes over the terminal size
     */
    return wrap(
      help.map((line) => string.interpolate(line, { binaryName: binary })),
      {
        startColumn: 2,
        trimStart: false,
        endColumn: terminalWidth,
      }
    ).join('\n')
  }

  /**
   * Returns the formatted description to be displayed in the list of commands
   *
   * @example
   * ```ts
   * formatter.formatListDescription() // Dimmed description text
   * ```
   */
  formatListDescription() {
    if (!this.#command.description) {
      return ''
    }
    return this.#colors.dim(this.#command.description)
  }

  /**
   * Returns an array of strings, each line contains an individual usage example
   *
   * @param aliases - Array of command aliases
   * @param binaryName - The binary name for usage examples
   *
   * @example
   * ```ts
   * formatter.formatUsage(['make'], 'node ace')
   * // ['  node ace generate:model [options] <name>', '  node ace make [options] <name>']
   * ```
   */
  formatUsage(aliases: string[], binaryName?: AllowedInfoValues): string[] {
    const binary = binaryName ? `${binaryName} ` : ''

    /**
     * Display options placeholder for flags
     */
    const flags = this.#command.flags.length ? this.#colors.dim('[options]') : ''

    /**
     * Display a list of named args
     */
    const args = this.#command.args
      .map((arg) => new ArgumentFormatter(arg, this.#colors).formatOption())
      .join(' ')

    /**
     * Separator between options placeholder and args
     */
    const separator = flags && args ? ` ${this.#colors.dim('[--]')} ` : ''

    const mainUsage = [`  ${binary}${this.#command.commandName} ${flags}${separator}${args}`]
    return mainUsage.concat(
      aliases.map((alias) => `  ${binary}${alias} ${flags}${separator}${args}`)
    )
  }
}
