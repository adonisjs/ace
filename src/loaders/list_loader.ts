/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { BaseCommand } from '../commands/base.js'
import type { CommandMetaData, LoadersContract } from '../types.js'

/**
 * The CommandsList loader registers commands classes with the kernel.
 * The commands are kept within memory
 */
export class ListLoader implements LoadersContract {
  #commands: (typeof BaseCommand)[]

  constructor(commands: (typeof BaseCommand)[]) {
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
  async getCommand(metaData: CommandMetaData): Promise<typeof BaseCommand | null> {
    return this.#commands.find((command) => command.commandName === metaData.commandName) || null
  }
}
