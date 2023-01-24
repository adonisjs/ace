/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { extname } from 'node:path'
import { fsImportAll } from '@poppinss/utils'

import { validateCommand } from '../helpers.js'
import { BaseCommand } from '../commands/base.js'
import type { CommandMetaData, LoadersContract } from '../types.js'

const JS_MODULES = ['.js', '.cjs', '.mjs']

export class FsLoader implements LoadersContract {
  /**
   * Absolute path to directory from which to load files
   */
  #comandsDirectory: string

  /**
   * An array of loaded commands
   */
  #commands: (typeof BaseCommand)[] = []

  constructor(comandsDirectory: string) {
    this.#comandsDirectory = comandsDirectory
  }

  /**
   * Returns a collection of commands. The command value
   * is unknown and must be validated
   */
  async #loadCommands(): Promise<Record<string, unknown>> {
    return fsImportAll(this.#comandsDirectory, {
      filter: (filePath: string) => {
        const ext = extname(filePath)
        if (JS_MODULES.includes(ext)) {
          return true
        }

        if (ext === '.ts' && !filePath.endsWith('.d.ts')) {
          return true
        }

        return false
      },
    })
  }

  /**
   * Returns the metadata of commands
   */
  async getMetaData(): Promise<CommandMetaData[]> {
    const commandsCollection = await this.#loadCommands()

    Object.keys(commandsCollection).forEach((key) => {
      const command = commandsCollection[key]
      validateCommand(command, `"${key}" file`)
      this.#commands.push(command)
    })

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
