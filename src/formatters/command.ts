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

import { ArgumentFormatter } from './argument.js'
import type { AllowedInfoValues, CommandMetaData, UIPrimitives } from '../types.js'

/**
 * The command formatter exposes API to format command data for the
 * commands list and the command help.
 */
export class CommandFormatter {
  #command: CommandMetaData
  #colors: UIPrimitives['colors']

  constructor(command: CommandMetaData, colors: UIPrimitives['colors']) {
    this.#command = command
    this.#colors = colors
  }

  /**
   * Returns the formatted command name to be displayed in the list
   * of commands
   */
  formatListName(aliases: string[]) {
    const formattedAliases = aliases.length ? ` ${this.#colors.dim(`(${aliases.join(', ')})`)}` : ''
    return `  ${this.#colors.green(this.#command.commandName)}${formattedAliases}  `
  }

  /**
   * Returns the formatted description of the command
   */
  formatDescription() {
    return this.#command.description || ''
  }

  /**
   * Returns multiline command help
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
   * Returns the formatted description to be displayed in the list
   * of commands
   */
  formatListDescription() {
    if (!this.#command.description) {
      return ''
    }
    return this.#colors.dim(this.#command.description)
  }

  /**
   * Returns an array of strings, each line contains an individual usage
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
