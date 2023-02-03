/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { TERMINAL_SIZE, wrap } from '@poppinss/cliui/helpers'

import { BaseCommand } from './base.js'
import { args } from '../decorators/args.js'
import { ListFormatter } from '../formatters/list.js'
import { FlagFormatter } from '../formatters/flag.js'
import { renderErrorWithSuggestions } from '../helpers.js'
import { CommandFormatter } from '../formatters/command.js'
import { ArgumentFormatter } from '../formatters/argument.js'
import type { CommandMetaData, ListTable } from '../types.js'

/**
 * The Help command is used to view help for a given command
 */
export class HelpCommand extends BaseCommand {
  /**
   * Command metadata
   */
  static commandName: string = 'help'
  static description: string = 'View help for a given command'

  /**
   * The command name argument
   */
  @args.string({ description: 'Command name', argumentName: 'command' })
  declare commandName: string

  /**
   * Returns the command arguments table
   */
  #makeArgumentsTable(heading: string, command: CommandMetaData): ListTable[] {
    if (!command.args.length) {
      return []
    }

    return [
      {
        heading: this.colors.yellow(heading),
        columns: command.args.map((arg) => {
          const formatter = new ArgumentFormatter(arg, this.colors)
          return {
            option: formatter.formatListOption(),
            description: formatter.formatDescription(),
          }
        }),
      },
    ]
  }

  /**
   * Returns the commands options table
   */
  #makeOptionsTable(heading: string, command: CommandMetaData): ListTable[] {
    if (!command.flags.length) {
      return []
    }

    return [
      {
        heading: this.colors.yellow(heading),
        columns: command.flags.map((flag) => {
          const formatter = new FlagFormatter(flag, this.colors)
          return {
            option: formatter.formatOption(),
            description: formatter.formatDescription(),
          }
        }),
      },
    ]
  }

  /**
   * Validates the command name to ensure it exists
   */
  #validateCommandName(): boolean {
    const command = this.kernel.getCommand(this.commandName)
    if (!command) {
      renderErrorWithSuggestions(
        this.ui,
        `Command "${this.commandName}" is not defined`,
        this.kernel.getCommandSuggestions(this.commandName)
      )
      return false
    }

    return true
  }

  /**
   * Logs command description
   */
  protected renderDescription(command: CommandMetaData) {
    const formatter = new CommandFormatter(command, this.colors)
    const description = wrap([formatter.formatDescription()], {
      startColumn: 2,
      trimStart: false,
      endColumn: TERMINAL_SIZE,
    }).join('\n')

    if (!description) {
      return
    }

    this.logger.log('')
    this.logger.log(this.colors.yellow('Description:'))
    this.logger.log(description)
  }

  /**
   * Logs command usage
   */
  protected renderUsage(command: CommandMetaData) {
    const aliases = this.kernel.getCommandAliases(command.commandName)
    const formatter = new CommandFormatter(command, this.colors)
    const usage = formatter.formatUsage(aliases, this.kernel.info.get('binary')).join('\n')

    this.logger.log('')
    this.logger.log(this.colors.yellow('Usage:'))
    this.logger.log(usage)
  }

  /**
   * Logs commands arguments and options tables
   */
  protected renderList(command: CommandMetaData) {
    const tables = this.#makeArgumentsTable('Arguments:', command).concat(
      this.#makeOptionsTable('Options:', command)
    )

    new ListFormatter(tables).format().forEach((table) => {
      this.logger.log('')
      this.logger.log(table.heading)
      this.logger.log(table.rows.join('\n'))
    })
  }

  /**
   * Logs command help text
   */
  protected renderHelp(command: CommandMetaData) {
    const formatter = new CommandFormatter(command, this.colors)
    const help = formatter.formatHelp(this.kernel.info.get('binary'))
    if (!help) {
      return
    }

    this.logger.log('')
    this.logger.log(this.colors.yellow('Help:'))
    this.logger.log(help)
  }

  /**
   * Executed by ace directly
   */
  async run() {
    const isValidCommand = this.#validateCommandName()
    if (!isValidCommand) {
      this.exitCode = 1
      return
    }

    const command = this.kernel.getCommand(this.commandName)!
    this.renderDescription(command)
    this.renderUsage(command)
    this.renderList(command)
    this.renderHelp(command)
  }
}
