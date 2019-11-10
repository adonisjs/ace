/*
* @adonisjs/cli
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { writeFile, readFile } from 'fs'
import { esmRequire } from '@poppinss/utils'
import { join, isAbsolute, extname } from 'path'

import { validateCommand } from '../utils/validateCommand'
import { ManifestNode, CommandConstructorContract } from '../Contracts'
import { CommandValidationException } from '../Exceptions/CommandValidationException'

/**
 * Manifest class drastically improves the commands performance, by generating
 * a manifest file for all the commands and lazy load only the executed
 * command.
 */
export class Manifest {
  constructor (private _appRoot: string) {
  }

  /**
   * Write file to the disk
   */
  private _writeManifest (manifest: ManifestNode): Promise<void> {
    return new Promise((resolve, reject) => {
      writeFile(join(this._appRoot, 'ace-manifest.json'), JSON.stringify(manifest), (error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  /**
   * Require and return command
   */
  public loadCommand (commandPath: string): CommandConstructorContract {
    const absPath = isAbsolute(commandPath) ? commandPath : join(this._appRoot, commandPath)

    const command = esmRequire(absPath)
    if (!command.name) {
      throw CommandValidationException.invalidManifestExport(commandPath)
    }

    command.$boot()
    return command
  }

  /**
   * Generates the manifest file for the given command paths
   */
  public async generate (commandPaths: string[]) {
    const manifest = commandPaths.reduce((manifest: ManifestNode, commandPath) => {
      const command = this.loadCommand(commandPath)
      validateCommand(command)
      command.$boot()

      manifest[command.commandName] = {
        settings: command.settings || {},
        commandPath: commandPath.replace(new RegExp(`${extname(commandPath)}$`), ''),
        commandName: command.commandName,
        description: command.description,
        args: command.args,
        flags: command.flags,
      }

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
      readFile(join(this._appRoot, 'ace-manifest.json'), 'utf-8', (error, contents) => {
        if (error) {
          reject(error)
        } else {
          resolve(JSON.parse(contents))
        }
      })
    })
  }
}
