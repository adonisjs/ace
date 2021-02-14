/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { readJSON } from 'fs-extra'
import { esmRequire } from '@poppinss/utils'
import { resolveFrom } from '@poppinss/utils/build/helpers'

import {
  Aliases,
  ManifestNode,
  ManifestCommand,
  ManifestLoaderContract,
  CommandConstructorContract,
} from '../Contracts'

import { validateCommand } from '../utils/validateCommand'

/**
 * The manifest loader exposes the API to load ace commands from one
 * or more manifest files.
 */
export class ManifestLoader implements ManifestLoaderContract {
  /**
   * An array of defined manifest files
   */
  private manifestFiles: (ManifestNode & {
    basePath: string
  })[] = []

  public booted: boolean = false

  constructor(private files: { basePath: string; manifestAbsPath: string }[]) {}

  /**
   * Loads the manifest file from the disk
   */
  private async loadManifestFile(file: {
    basePath: string
    manifestAbsPath: string
  }): Promise<
    ManifestNode & {
      basePath: string
    }
  > {
    const manifestCommands = await readJSON(file.manifestAbsPath)

    /**
     * Find if we are dealing with an old or the new manifest file
     */
    const isNewManifestFile = manifestCommands['commands'] && manifestCommands['aliases']

    const commands = isNewManifestFile ? manifestCommands['commands'] : manifestCommands
    const aliases = isNewManifestFile ? manifestCommands['aliases'] : {}

    return { basePath: file.basePath, commands, aliases }
  }

  /**
   * Returns the command manifest node for a give command
   */
  private getCommandManifest(commandName: string) {
    return this.manifestFiles.find(({ commands, aliases }) => {
      const aliasCommandName = aliases[commandName]
      return commands[commandName] || commands[aliasCommandName]
    })
  }

  /**
   * Boot manifest loader to read all manifest files from the disk
   */
  public async boot() {
    if (this.booted) {
      return
    }

    this.booted = true
    this.manifestFiles = await Promise.all(this.files.map((file) => this.loadManifestFile(file)))
  }

  /**
   * Returns base path for a given command
   */
  public getCommandBasePath(commandName: string): string | undefined {
    return this.getCommandManifest(commandName)?.basePath
  }

  /**
   * Returns manifest command node. One must load the command
   * in order to use it
   */
  public getCommand(
    commandName: string
  ): { basePath: string; command: ManifestCommand } | undefined {
    const manifestCommands = this.getCommandManifest(commandName)
    if (!manifestCommands) {
      return
    }

    const aliasCommandName = manifestCommands.aliases[commandName]
    return {
      basePath: manifestCommands.basePath,
      command:
        manifestCommands.commands[commandName] || manifestCommands.commands[aliasCommandName],
    }
  }

  /**
   * Find if a command exists or not
   */
  public hasCommand(commandName: string): boolean {
    return !!this.getCommandBasePath(commandName)
  }

  /**
   * Load command from the disk. Make sure to use [[hasCommand]] before
   * calling this method
   */
  public async loadCommand(commandName: string): Promise<CommandConstructorContract> {
    const { basePath, command } = this.getCommand(commandName)!
    const commandConstructor = esmRequire(resolveFrom(basePath, command.commandPath))
    validateCommand(commandConstructor)
    return commandConstructor
  }

  /**
   * Returns an array of manifest commands
   */
  public getCommands() {
    return this.manifestFiles.reduce<{
      commands: ManifestCommand[]
      aliases: Aliases
    }>(
      (result, { commands, aliases }) => {
        Object.keys(commands).forEach((commandName) => {
          result.commands = result.commands.concat(commands[commandName])
        })

        Object.assign(result.aliases, aliases)
        return result
      },
      { commands: [], aliases: {} }
    )
  }
}
