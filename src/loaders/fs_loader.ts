/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fileURLToPath } from 'node:url'
import { basename, extname, join, relative } from 'node:path'
import { fsReadAll, importDefault, slash } from '@poppinss/utils'

import { validateCommand } from '../helpers.js'
import type { AbstractBaseCommand, CommandMetaData, LoadersContract } from '../types.js'

const JS_MODULES = ['.js', '.cjs', '.mjs']

/**
 * Fs loader exposes the API to load commands from a directory. All files
 * ending with ".js", ".cjs", ".mjs", ".ts" and ".mts" are considered
 * as commands
 */
export class FsLoader<Command extends AbstractBaseCommand> implements LoadersContract<Command> {
  /**
   * Absolute path to directory from which to load files
   */
  #comandsDirectory: string

  /**
   * File to ignore files
   */
  #filter?: (filePath: string) => boolean

  /**
   * An array of loaded commands
   */
  #commands: { command: Command; filePath: string; absoluteFilePath: string }[] = []

  constructor(comandsDirectory: string, filter?: (filePath: string) => boolean) {
    this.#comandsDirectory = comandsDirectory
    this.#filter = filter
  }

  /**
   * Returns a collection of commands. The command value
   * is unknown and must be validated
   */
  async #loadCommands(): Promise<Record<string, unknown>> {
    const commands: Record<string, unknown> = {}

    /**
     * Scanning all files
     */
    const commandFiles = await fsReadAll(this.#comandsDirectory, {
      pathType: 'url',
      ignoreMissingRoot: true,
      filter: (filePath: string) => {
        const ext = extname(filePath)

        /**
         * Ignore files prefixed with _
         */
        if (basename(filePath).startsWith('_')) {
          return false
        }

        if (JS_MODULES.includes(ext)) {
          return true
        }

        if (ext === '.ts' && !filePath.endsWith('.d.ts')) {
          return true
        }

        return false
      },
    })

    /**
     * Importing files and validating the exports to have a default
     * export
     */
    for (let file of commandFiles) {
      /**
       * Remapping .ts files to .js, otherwise the file cannot imported
       */
      if (file.endsWith('.ts')) {
        file = file.replace(/\.ts$/, '.js')
      }

      const relativeFileName = slash(relative(this.#comandsDirectory, fileURLToPath(file)))

      /**
       * Import file if no filters are defined or the filter
       * allows the file
       */
      if (!this.#filter || this.#filter(relativeFileName)) {
        commands[relativeFileName] = await importDefault(() => import(file), relativeFileName)
      }
    }

    return commands
  }

  /**
   * Returns the metadata of commands
   */
  async getMetaData(): Promise<CommandMetaData[]> {
    const commandsCollection = await this.#loadCommands()

    Object.keys(commandsCollection).forEach((key) => {
      const command = commandsCollection[key]
      validateCommand<Command>(command, `"${key}" file`)

      this.#commands.push({
        command,
        filePath: key,
        absoluteFilePath: slash(join(this.#comandsDirectory, key)),
      })
    })

    return this.#commands.map(({ command, filePath, absoluteFilePath }) => {
      return Object.assign({}, command.serialize(), { filePath, absoluteFilePath })
    })
  }

  /**
   * Returns the command class constructor for a given command. Null
   * is returned when unable to lookup the command
   */
  async getCommand(metaData: CommandMetaData): Promise<Command | null> {
    return (
      this.#commands.find(({ command }) => {
        return command.commandName === metaData.commandName
      })?.command || null
    )
  }
}
