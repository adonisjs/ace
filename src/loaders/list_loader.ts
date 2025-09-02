/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { AbstractBaseCommand, CommandMetaData, LoadersContract } from '../types.ts'

/**
 * List loader exposes the API to register commands as classes
 *
 * @example
 * ```ts
 * const loader = new ListLoader([MyCommand, AnotherCommand])
 * const metadata = await loader.getMetaData()
 * const command = await loader.getCommand(metadata[0])
 * ```
 */
export class ListLoader<Command extends AbstractBaseCommand> implements LoadersContract<Command> {
  /**
   * Array of command classes
   */
  #commands: Command[]

  /**
   * Create a new list loader
   *
   * @param commands - Array of command classes to register
   */
  constructor(commands: Command[]) {
    this.#commands = commands
  }

  /**
   * Returns an array of command metadata for all registered commands
   *
   * @example
   * ```ts
   * const metadata = await loader.getMetaData()
   * metadata.forEach(cmd => console.log(cmd.commandName))
   * ```
   */
  async getMetaData(): Promise<CommandMetaData[]> {
    return this.#commands.map((command) => command.serialize())
  }

  /**
   * Returns the command class constructor for a given command. Null
   * is returned when unable to lookup the command
   *
   * @param metaData - The command metadata to find
   *
   * @example
   * ```ts
   * const command = await loader.getCommand(metadata)
   * if (command) {
   *   const instance = new command(kernel, parsed, ui, prompt)
   * }
   * ```
   */
  async getCommand(metaData: CommandMetaData): Promise<Command | null> {
    return this.#commands.find((command) => command.commandName === metaData.commandName) || null
  }
}
