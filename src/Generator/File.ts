/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { basename, join, isAbsolute, sep } from 'path'
import { template, templateFromFile } from 'smpltmpl'
import { StringTransformer } from './StringTransformer'
import { GeneratorFileOptions, GeneratorFileContract } from '../Contracts'

/**
 * Exposes the API to construct the output file content, path
 * and template source.
 */
export class GeneratorFile implements GeneratorFileContract {
  private _stub: string
  private _isStubRaw: boolean
  private _destinationDir: string
  private _appRoot?: string
  private _templateContents: any = {}

  constructor (
    private _name: string,
    private _options: GeneratorFileOptions = {},
  ) {
  }

  /**
   * Returns relative path for the file. Useful for
   * printing log info
   */
  private _getFileRelativePath (filepath: string) {
    if (this._appRoot) {
      return filepath.replace(`${this._appRoot}${sep}`, '')
    }

    return filepath
  }

  /**
   * Set stub for the contents source. When `raw` is true, then string
   * is considered as the raw content and not the file path.
   */
  public stub (fileOrContents: string, options?: { raw: boolean }): this {
    this._stub = fileOrContents
    this._isStubRaw = !!(options && options.raw)
    return this
  }

  /**
   * Define the destination directory for creating the
   * file.
   */
  public destinationDir (directory: string): this {
    this._destinationDir = directory
    return this
  }

  /**
   * Define `appRoot`. This is just to shorten the logged
   * file names. For example:
   */
  public appRoot (directory: string): this {
    this._appRoot = directory
    return this
  }

  /**
   * Variables for stub subsitution
   */
  public apply (contents: any): this {
    this._templateContents = contents
    return this
  }

  /**
   * Returns the file json
   */
  public toJSON () {
    const extension = this._options.extname || '.ts'

    const filename = new StringTransformer(basename(this._name))
      .dropExtension()
      .cleanSuffix(this._options.suffix)
      .changeForm(this._options.form)
      .addSuffix(this._options.suffix)
      .changeCase(this._options.pattern || 'pascalcase')
      .toValue()

    /**
     * Computes the file absolute path, where the file will be created
     */
    const filepath = isAbsolute(this._destinationDir)
      ? join(this._destinationDir, filename)
      : (
        this._appRoot
          ? join(this._appRoot, this._destinationDir, filename)
          : join(this._destinationDir, filename)
      )

    /**
     * Contents to the template file
     */
    const contents = this._stub
      ? (
        this._isStubRaw
        ? template(this._stub, this._templateContents)
        : templateFromFile(this._stub, this._templateContents)
      )
      : ''

    return {
      filename,
      filepath: `${filepath}${extension}`,
      relativepath: this._getFileRelativePath(`${filepath}${extension}`),
      extension,
      contents,
    }
  }
}
