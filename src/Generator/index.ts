/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { Logger } from '@poppinss/fancy-logs'
import { outputFile, pathExists } from 'fs-extra'

import { GeneratorFile } from './File'
import { GeneratorFileOptions, GeneratorContract } from '../Contracts'

/**
 * Exposes the API to generate entity files, like project
 * `Controllers`, `Models` and so on.
 */
export class Generator implements GeneratorContract {
  private _files: GeneratorFile[] = []

  constructor (
    private _logger: Logger,
    private _destinationDir?: string,
  ) {
  }

  /**
   * Add a new file to the files generator. You can add multiple files
   * together and they will be created when `run` is invoked.
   */
  public addFile (name: string, options?: GeneratorFileOptions) {
    const file = new GeneratorFile(name, options)

    if (this._destinationDir) {
      file.destinationDir(this._destinationDir)
    }

    this._files.push(file)
    return file
  }

  /**
   * Run the generator and create all files registered using `addFiles`
   */
  public async run () {
    for (let file of this._files) {
      const fileJSON = file.toJSON()
      const exists = await pathExists(fileJSON.filepath)

      if (exists) {
        this._logger.skip(`${fileJSON.relativepath} already exists`)
        return
      }

      await outputFile(fileJSON.filepath, fileJSON.contents)
      this._logger.create(fileJSON.relativepath)
    }
  }

  /**
   * Clear the registered files from the generator
   */
  public clear () {
    this._files = []
  }
}
