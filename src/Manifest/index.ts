/*
* @adonisjs/cli
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import resolveFrom from 'resolve-from'
import { writeFile, readFile } from 'fs'
import { esmRequire } from '@poppinss/utils'
import { join, isAbsolute, extname } from 'path'

import { validateCommand } from '../utils/validateCommand'
import { ManifestNode, CommandConstructorContract } from '../Contracts'
import { CommandValidationException } from '../Exceptions/CommandValidationException'
import { MissingManifestFileException } from '../Exceptions/MissingManifestFileException'

/**
 * Manifest class drastically improves the commands performance, by generating
 * a manifest file for all the commands and lazy load only the executed
 * command.
 */
export class Manifest {
  constructor (private _basePath: string) {
  }

  /**
   * Write file to the disk
   */
  private _writeManifest (manifest: ManifestNode): Promise<void> {
    return new Promise((resolve, reject) => {
      writeFile(join(this._basePath, 'ace-manifest.json'), JSON.stringify(manifest), (error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  /**
   * Loads a single command from the manifest commands list.
   */
  public loadCommand (commandPath: string): CommandConstructorContract {
    const absPath = resolveFrom(this._basePath, commandPath)
    const command = esmRequire(absPath)

    if (!command.name) {
      throw CommandValidationException.invalidManifestExport(commandPath)
    }

    command.$boot()
    return command
  }

  /**
   * Look up commands from a given path. The modules can also return an array
   * of sub-paths from where to load additional commands.
   */
  public lookupCommands (commandPath: string): CommandConstructorContract[] {
    /**
     * Absolute paths are not allowed when looking up commands to be saved
     * inside the manifest file. This is required, since one can accidentally
     * generate absolute paths on their local machine and then trying to
     * execute commands on a server
     */
    if (isAbsolute(commandPath)) {
      throw new Error('Absolute path to commands are not allowed, since manifest file needs to be portable')
    }

    const absPath = resolveFrom(this._basePath, commandPath)
    const commandOrCommands = esmRequire(absPath)

    /**
     * The command exports an array of subpaths. Only one level
     * of subpaths are allowed.
     */
    if (Array.isArray(commandOrCommands)) {
      return commandOrCommands.map((commandPath) => {
        return this.loadCommand(commandPath)
      })
    }

    return [this.loadCommand(commandPath)]
  }

  /**
   * Generates the manifest file for the given command paths
   */
  public async generate (commandPaths: string[]) {
    const manifest = commandPaths.reduce((manifest: ManifestNode, commandPath) => {
      const commands = this.lookupCommands(commandPath)

      commands.forEach((command) => {
        validateCommand(command)

        manifest[command.commandName] = {
          settings: command.settings || {},
          commandPath: commandPath.replace(new RegExp(`${extname(commandPath)}$`), ''),
          commandName: command.commandName,
          description: command.description,
          args: command.args,
          flags: command.flags,
        }
      })

      return manifest
    }, {})

    await this._writeManifest(manifest)
  }

  /**
   * Load the manifest file from the disk. An exception is raised
   * when `manifest` file is missing. So the consumer must ensure
   * that file exists before calling this method.
   */
  public load (): Promise<ManifestNode> {
    return new Promise((resolve, reject) => {
      readFile(join(this._basePath, 'ace-manifest.json'), 'utf-8', (error, contents) => {
        if (error) {
          if (error.code === 'ENOENT') {
            reject(MissingManifestFileException.invoke())
          } else {
            reject(error)
          }
        } else {
          resolve(JSON.parse(contents))
        }
      })
    })
  }
}
