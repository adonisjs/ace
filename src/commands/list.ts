/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { BaseCommand } from './base.js'
import { args } from '../decorators/args.js'
import { FlagFormatter } from '../formatters/flag.js'
import { ListFormatter } from '../formatters/list.js'
import { renderErrorWithSuggestions } from '../helpers.js'
import { CommandFormatter } from '../formatters/command.js'
import type { CommandMetaData, Flag, ListTable } from '../types.js'

/**
 * The list command is used to view a list of commands
 */
export class ListCommand extends BaseCommand {
  /**
   * Command metadata
   */
  static commandName: string = 'list'
  static description: string = 'View list of available commands'
  static help = [
    'The list command displays a list of all the commands:',
    '  {{ binaryName }}list',
    '',
    'You can also display the commands for a specific namespace:',
    '  {{ binaryName }}list <namespace...>',
  ]

  /**
   * Optional flag to filter list by namespace
   */
  @args.spread({
    description: 'Filter list by namespace',
    required: false,
  })
  namespaces?: string[]

  /**
   * Returns a table for an array of commands.
   */
  #makeCommandsTable(heading: string, commands: CommandMetaData[]): ListTable {
    return {
      heading: this.colors.yellow(heading),
      columns: commands.map((command) => {
        const aliases = this.kernel.getCommandAliases(command.commandName)
        const commandFormatter = new CommandFormatter(command, this.colors)

        return {
          option: commandFormatter.formatListName(aliases),
          description: commandFormatter.formatListDescription(),
        }
      }),
    }
  }

  /**
   * Returns a table for an array of global options
   */
  #makeOptionsTable(heading: string, flagsList: Flag[]): ListTable {
    return {
      heading: this.colors.yellow(heading),
      columns: flagsList.map((flag) => {
        const flagFormatter = new FlagFormatter(flag, this.colors)

        return {
          option: flagFormatter.formatOption(),
          description: flagFormatter.formatDescription(),
        }
      }),
    }
  }

  /**
   * Returns an array of tables for all the commands or for mentioned
   * namespaces only
   */
  #getCommandsTables(namespaces?: string[]) {
    if (namespaces && namespaces.length) {
      return namespaces.map((namespace) => {
        return this.#makeCommandsTable(namespace, this.kernel.getNamespaceCommands(namespace))
      })
    }

    return [
      this.#makeCommandsTable('Available commands:', this.kernel.getNamespaceCommands()),
      ...this.kernel
        .getNamespaces()
        .map((namespace) =>
          this.#makeCommandsTable(namespace, this.kernel.getNamespaceCommands(namespace))
        ),
    ]
  }

  /**
   * Returns table for the global flags
   */
  #getOptionsTable() {
    if (!this.kernel.flags.length) {
      return []
    }

    return [this.#makeOptionsTable('Options:', this.kernel.flags)]
  }

  /**
   * Validates the namespaces mentioned via the "namespaces"
   * flag
   */
  #validateNamespace(): boolean {
    if (!this.namespaces) {
      return true
    }

    const namespaces = this.kernel.getNamespaces()
    const unknownNamespace = this.namespaces.find((namespace) => !namespaces.includes(namespace))

    /**
     * Show error when the namespace is not known
     */
    if (unknownNamespace) {
      renderErrorWithSuggestions(
        this.ui,
        `Namespace "${unknownNamespace}" is not defined`,
        this.kernel.getNamespaceSuggestions(unknownNamespace)
      )
      return false
    }

    return true
  }

  /**
   * The method is used to render a list of options and commands
   */
  protected renderList() {
    const tables = this.#getOptionsTable().concat(this.#getCommandsTables(this.namespaces))

    new ListFormatter(tables).format().forEach((table) => {
      this.logger.log('')
      this.logger.log(table.heading)
      this.logger.log(table.rows.join('\n'))
    })
  }

  /**
   * Executed by ace directly
   */
  async run() {
    const hasValidNamespaces = this.#validateNamespace()
    if (!hasValidNamespaces) {
      this.exitCode = 1
      return
    }

    this.renderList()
  }
}
