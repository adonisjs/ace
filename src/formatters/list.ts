/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import stringWidth from 'string-width'
import { justify, TERMINAL_SIZE, wrap } from '@poppinss/cliui/helpers'

import type { ListTable } from '../types.js'

/**
 * The list formatter formats the list of commands and flags. The option column
 * is justified to have same width accross all the rows.
 */
export class ListFormatter {
  #tables: ListTable[]
  #largestOptionColumnWidth: number

  constructor(tables: ListTable[]) {
    this.#tables = tables
    this.#largestOptionColumnWidth = Math.max(
      ...this.#tables
        .map((table) => table.columns.map((column) => stringWidth(column.option)))
        .flat()
    )
  }

  /**
   * Formats the table to an array of plain text rows.
   */
  #formatTable(table: ListTable, terminalWidth: number): string[] {
    const options = justify(
      table.columns.map(({ option }) => option),
      { maxWidth: this.#largestOptionColumnWidth }
    )

    const descriptions = wrap(
      table.columns.map(({ description }) => description),
      {
        startColumn: this.#largestOptionColumnWidth,
        endColumn: terminalWidth,
        trimStart: true,
      }
    )

    return table.columns.map((_, index) => `${options[index]}${descriptions[index]}`)
  }

  /**
   * Format tables list into an array of rows
   */
  format(terminalWidth: number = TERMINAL_SIZE) {
    return this.#tables.map((table) => {
      return {
        heading: table.heading,
        rows: this.#formatTable(table, terminalWidth),
      }
    })
  }
}
