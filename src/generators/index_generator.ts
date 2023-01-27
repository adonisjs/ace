/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { copyFile, mkdir, writeFile } from 'node:fs/promises'

import { stubsRoot } from '../../stubs/main.js'
import { FsLoader } from '../loaders/fs_loader.js'

/**
 * The index generators creates a commands laoder that can be lazily
 * imported.
 *
 * Also, a command.json index file is created that has metadata for all
 * the files. Doing so, speeds up the commands lookup, as we do not
 * have to import all the classes just to find if a command exists
 * or not.
 */
export class IndexGenerator {
  #commandsDir: string

  constructor(commandsDir: string) {
    this.#commandsDir = commandsDir
  }

  /**
   * Generate index
   */
  async generate(): Promise<any> {
    const commandsMetaData = await new FsLoader(this.#commandsDir, ['main.js']).getMetaData()
    const indexJSON = JSON.stringify({ commands: commandsMetaData, version: 1 })
    const indexFile = join(this.#commandsDir, 'commands.json')

    const loaderFile = join(this.#commandsDir, 'main.js')
    const loaderStub = join(stubsRoot, 'commands_loader.stub')

    await mkdir(this.#commandsDir, { recursive: true })
    console.log(`artifacts directory: ${this.#commandsDir}`)

    await writeFile(indexFile, indexJSON)
    console.log('create commands.json')

    await copyFile(loaderStub, loaderFile)
    console.log('create main.js')
  }
}
