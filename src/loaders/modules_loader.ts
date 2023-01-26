/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RuntimeException } from '@poppinss/utils'

import { validateCommand, validCommandMetaData } from '../helpers.js'
import type { AbstractBaseCommand, CommandMetaData, LoadersContract } from '../types.js'

/**
 * Module based command loader must implement the following methods.
 */
interface CommandsModuleLoader {
  list: () => Promise<unknown>
  load: (command: CommandMetaData) => Promise<unknown>
}

/**
 * Modules loader exposes the API to lazy load commands from
 * ES modules.
 *
 * The modules have to implement the [[CommandsModuleLoader]] interface
 */
export class ModulesLoader<Command extends AbstractBaseCommand>
  implements LoadersContract<Command>
{
  /**
   * The import root is the base path to use when resolving
   * modules mentioned in the command source.
   */
  #importRoot: string | URL

  /**
   * An array of modules to import for loading commands
   */
  #commandSources: string[]

  /**
   * A collection of commands with their loaders. The key is the
   * command name and the value is the imported loader.
   */
  #commandsLoaders?: Map<string, { loader: CommandsModuleLoader; sourcePath: string }>

  constructor(importRoot: string | URL, commandSources: string[]) {
    this.#importRoot = importRoot
    this.#commandSources = commandSources
  }

  /**
   * Imports the source by first resolving its import path.
   */
  async #importSource(
    sourcePath: string
  ): Promise<{ loader: CommandsModuleLoader; importPath: string }> {
    const importPath = await import.meta.resolve!(sourcePath, this.#importRoot)
    const loader = await import(importPath)

    /**
     * Ensure the loader has list method
     */
    if (typeof loader.list !== 'function') {
      throw new RuntimeException(
        `Invalid command loader "${sourcePath}". Missing "list" method export`
      )
    }

    /**
     * Ensure the loader has load method
     */
    if (typeof loader.load !== 'function') {
      throw new RuntimeException(
        `Invalid command loader "${sourcePath}". Missing "load" method export`
      )
    }

    return { loader, importPath }
  }

  /**
   * Returns an array of commands returns by the loader list method
   */
  async #getCommandsList(loader: CommandsModuleLoader, importPath: string): Promise<unknown[]> {
    const list = await loader.list()
    if (!Array.isArray(list)) {
      throw new RuntimeException(
        `Invalid commands list. The "${importPath}.list" method must return an array of commands`
      )
    }

    return list
  }

  /**
   * Loads commands from the registered sources
   */
  async #loadCommands() {
    this.#commandsLoaders = new Map()
    const commands: CommandMetaData[] = []

    for (let sourcePath of this.#commandSources) {
      const { loader } = await this.#importSource(sourcePath)
      const list = await this.#getCommandsList(loader, sourcePath)

      list.forEach((metaData) => {
        validCommandMetaData(metaData, `"${sourcePath}.list" method`)
        commands.push(metaData)
        this.#commandsLoaders!.set(metaData.commandName, { loader, sourcePath })
      })
    }

    return commands
  }

  /**
   * Returns an array of command's metadata
   */
  async getMetaData(): Promise<CommandMetaData[]> {
    return this.#loadCommands()
  }

  /**
   * Returns the command class constructor for a given command. Null
   * is returned when unable to lookup the command
   */
  async getCommand(metaData: CommandMetaData): Promise<Command | null> {
    /**
     * Running "loadCommands" method instantiates the commands loader
     * collection
     */
    if (!this.#commandsLoaders) {
      await this.#loadCommands()
    }

    const commandLoader = this.#commandsLoaders!.get(metaData.commandName)
    if (!commandLoader) {
      return null
    }

    const command = await commandLoader.loader.load(metaData)
    if (command === null || command === undefined) {
      return null
    }

    validateCommand<Command>(command, `"${commandLoader.sourcePath}.load" method`)
    return command
  }
}
