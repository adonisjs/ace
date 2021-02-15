/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { outputFile, pathExists } from 'fs-extra'

import { GeneratorFile } from './File'
import { GeneratorFileOptions, GeneratorContract, CommandContract } from '../Contracts'

/**
 * Exposes the API to generate entity files, like project
 * `Controllers`, `Models` and so on.
 */
export class Generator implements GeneratorContract {
  private files: GeneratorFile[] = []

  constructor(private command: CommandContract, private destinationDir?: string) {}

  /**
   * Add a new file to the files generator. You can add multiple files
   * together and they will be created when `run` is invoked.
   */
  public addFile(name: string, options?: GeneratorFileOptions) {
    const file = new GeneratorFile(name, options)

    if (this.destinationDir) {
      file.destinationDir(this.destinationDir)
    }

    this.files.push(file)
    return file
  }

  /**
   * Run the generator and create all files registered using `addFiles`
   */
  public async run() {
    for (let file of this.files) {
      const fileJSON = file.toJSON()
      const exists = await pathExists(fileJSON.filepath)

      if (exists) {
        this.command.logger.action('create').skipped(fileJSON.relativepath, 'File already exists')
      } else {
        await outputFile(fileJSON.filepath, fileJSON.contents)
        file.state = 'persisted'
        this.command.logger.action('create').succeeded(fileJSON.relativepath)
      }
    }

    return this.files
  }

  /**
   * Clear the registered files from the generator
   */
  public clear() {
    this.files = []
  }
}
