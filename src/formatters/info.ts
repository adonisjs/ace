/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import stringWidth from 'string-width'
import { justify, TERMINAL_SIZE } from '@poppinss/cliui/helpers'
import type { AllowedInfoValues, UIPrimitives } from '../types.js'

/**
 * Info formatter is used to format the kernel info key-value pair
 * into a table.
 */
export default class InfoFormatter {
  #info: Map<string, AllowedInfoValues>
  #colors: UIPrimitives['colors']

  constructor(info: Map<string, AllowedInfoValues>, colors: UIPrimitives['colors']) {
    this.#info = info
    this.#colors = colors
  }

  /**
   * Formats the info map into an array of columns.
   */
  #createFormattedColumns() {
    return [...this.#info.keys()].map((key) => {
      const value = this.#info.get(key)
      const formattedValue = Array.isArray(value)
        ? value.map((item) => String(item)).join(',')
        : String(value)

      return {
        key: `${key} `,
        value: this.#colors.green(` ${formattedValue}`),
      }
    })
  }

  /**
   * Formats the info map into an array of rows
   */
  format(): string[] {
    const columns = this.#createFormattedColumns()
    const largestOptionColumnWidth = Math.max(...columns.map((column) => stringWidth(column.key)))

    const keys = justify(
      columns.map(({ key }) => key),
      { maxWidth: largestOptionColumnWidth, paddingChar: this.#colors.dim('─') }
    )

    const values = justify(
      columns.map(({ value }) => value),
      {
        maxWidth: TERMINAL_SIZE - largestOptionColumnWidth,
        paddingChar: this.#colors.dim('─'),
        align: 'right',
      }
    )

    return columns.map((_, index) => `${keys[index]}${values[index]}`)
  }
}
