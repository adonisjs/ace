/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { extname } from 'path'
import pluralize from 'pluralize'
import snakeCase from 'snake-case'
import camelCase from 'camel-case'
import pascalCase from 'pascal-case'

/**
 * Exposes the API to transform a string
 */
export class StringTransformer {
  constructor (private _input: string) {
  }

  /**
   * Cleans suffix from the input.
   */
  public cleanSuffix (suffix?: string): this {
    if (!suffix) {
      return this
    }

    this._input = this._input.replace(new RegExp(`[-_]?${suffix}$`, 'i'), '')
    return this
  }

  /**
   * Add suffix to the file name
   */
  public addSuffix (suffix?: string): this {
    if (!suffix) {
      return this
    }

    this._input = `${this._input}_${suffix}`
    return this
  }

  /**
   * Changes the name form by converting it to singular
   * or plural case
   */
  public changeForm (form?: 'singular' | 'plural'): this {
    if (!form) {
      return this
    }

    this._input = pluralize[form](this._input)
    return this
  }

  /**
   * Changes the input case
   */
  public changeCase (pattern?: 'pascalcase' | 'camelcase' | 'snakecase'): this {
    switch (pattern) {
      case 'camelcase':
        this._input = camelCase(this._input)
        return this
      case 'pascalcase':
        this._input = pascalCase(this._input)
        return this
      case 'snakecase':
        this._input = snakeCase(this._input)
        return this
      default:
        return this
    }
  }

  /**
   * Drops the extension from the input
   */
  public dropExtension (): this {
    this._input = this._input.replace(new RegExp(`${extname(this._input)}$`), '')
    return this
  }

  /**
   * Returns the transformed value
   */
  public toValue () {
    return this._input
  }
}
