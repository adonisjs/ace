/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { basename, join, isAbsolute, sep } from 'path'

import { StringTransformer } from './StringTransformer'
import { template, templateFromFile } from '../utils/template'
import { GeneratorFileOptions, GeneratorFileContract } from '../Contracts'

/**
 * Exposes the API to construct the output file content, path
 * and template source.
 */
export class GeneratorFile implements GeneratorFileContract {
  private stubContents: string
  private isStubRaw: boolean
  private templateData: any = {}
  private customDestinationPath?: string
  private customAppRoot?: string
  private mustache: boolean = false

  constructor(private name: string, private options: GeneratorFileOptions = {}) {}

  /**
   * Returns relative path for the file. Useful for
   * printing log info
   */
  private getFileRelativePath(filepath: string) {
    if (this.customAppRoot) {
      return filepath.replace(`${this.customAppRoot}${sep}`, '')
    }

    return filepath
  }

  /**
   * Set stub for the contents source. When `raw` is true, then string
   * is considered as the raw content and not the file path.
   */
  public stub(fileOrContents: string, options?: { raw: boolean }): this {
    this.stubContents = fileOrContents
    this.isStubRaw = !!(options && options.raw)
    return this
  }

  /**
   * Optionally define  destination directory from the project root.
   */
  public destinationDir(directory: string): this {
    this.customDestinationPath = directory
    return this
  }

  /**
   * Define `appRoot`. This is just to shorten the logged
   * file names. For example:
   */
  public appRoot(directory: string): this {
    this.customAppRoot = directory
    return this
  }

  /**
   * Instruct to use mustache
   */
  public useMustache() {
    this.mustache = true
    return this
  }

  /**
   * Variables for stub subsitution
   */
  public apply(contents: any): this {
    this.templateData = contents
    return this
  }

  /**
   * Returns the file json
   */
  public toJSON() {
    const extension = this.options.extname || '.ts'

    const filename = new StringTransformer(basename(this.name))
      .dropExtension()
      .cleanSuffix(this.options.suffix)
      .cleanPrefix(this.options.prefix)
      .changeForm(this.options.form, this.options.formIgnoreList)
      .addSuffix(this.options.suffix)
      .addPrefix(this.options.prefix)
      .changeCase(this.options.pattern)
      .toValue()

    const initialFilePath = this.name.replace(basename(this.name), filename)

    const appRoot = this.customAppRoot || process.cwd()

    /**
     * Computes the file absolute path, where the file will be created.
     *
     * 1. If `customDestinationPath` is not defined, we will merge the
     *    `appRoot` + `initialFilePath`.
     *
     * 2. If `customDestinationPath` is absolute, then we ignore the appRoot
     *    and merge `customDestinationPath` + `initialFilePath`
     *
     * 3. Otherwise we merge `appRoot` + `customDestinationPath` + `initialFilePath`.
     */
    const filepath = this.customDestinationPath
      ? isAbsolute(this.customDestinationPath)
        ? join(this.customDestinationPath, initialFilePath)
        : join(appRoot, this.customDestinationPath, initialFilePath)
      : join(appRoot, initialFilePath)

    /**
     * Passing user values + the filename and extension
     */
    const templateContents = Object.assign({ extension, filename }, this.templateData)

    /**
     * Contents of the template file
     */
    const contents = this.stubContents
      ? this.isStubRaw
        ? template(this.stubContents, templateContents, undefined, this.mustache)
        : templateFromFile(this.stubContents, templateContents, this.mustache)
      : ''

    return {
      filename,
      filepath: `${filepath}${extension}`,
      relativepath: this.getFileRelativePath(`${filepath}${extension}`),
      extension,
      contents,
    }
  }
}
