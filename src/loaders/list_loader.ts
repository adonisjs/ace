/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { AbstractBaseCommand, CommandMetaData, LoadersContract } from '../types.js'

/**
 * The CommandsList loader registers commands classes with the kernel.
 * The commands are kept within memory
 */
export class ListLoader<Command extends AbstractBaseCommand> implements LoadersContract<Command> {
  #commands: Command[]

  constructor(commands: Command[]) {
    this.#commands = commands
  }

  /**
   * Returns an array of command's metadata
   */
  async getMetaData(): Promise<CommandMetaData[]> {
    return this.#commands.map((command) => command.serialize())
  }

  /**
   * Returns the command class constructor for a given command. Null
   * is returned when unable to lookup the command
   */
  async getCommand(metaData: CommandMetaData): Promise<Command | null> {
    return this.#commands.find((command) => command.commandName === metaData.commandName) || null
  }
}
