/**
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Colors } from './Base'

/**
 * Stringify class returns a plain string in a format of function
 * calls. The output is reliable and easy to test.
 */
export class Stringify extends Colors {
  private _chain: string[] = []

  /**
   * Perform the given transformation. The base class will
   * invoke this method
   */
  protected $transform (transformation: string, text?: string): string | this {
    this._chain.push(transformation)

    if (text !== undefined) {
      const output = `${this._chain.join('(')}(${text})${new Array(this._chain.length).join(')')}`
      this._chain = []
      return output
    }

    return this
  }
}
