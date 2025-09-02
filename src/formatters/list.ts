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

import type { ListTable } from '../types.ts'

/**
 * The list formatter formats the list of commands and flags. The option column
 * is justified to have same width across all the rows.
 *
 * @example
 * ```ts
 * const formatter = new ListFormatter(tables)
 * const formatted = formatter.format() // Array of formatted tables
 * ```
 */
export class ListFormatter {
  /**
   * Array of tables to format
   */
  #tables: ListTable[]

  /**
   * The width of the largest option column across all tables
   */
  #largestOptionColumnWidth: number

  /**
   * Create a new list formatter
   *
   * @param tables - Array of tables to format
   */
  constructor(tables: ListTable[]) {
    this.#tables = tables
    this.#largestOptionColumnWidth = Math.max(
      ...this.#tables
        .map((table) => table.columns.map((column) => stringWidth(column.option)))
        .flat()
    )
  }

  /**
   * Formats a single table to an array of plain text rows
   *
   * @param table - The table to format
   * @param terminalWidth - Width of the terminal for text wrapping
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
   * Format all tables into an array of formatted table objects
   *
   * @param terminalWidth - Width of the terminal for text wrapping
   *
   * @example
   * ```ts
   * formatter.format() // [{ heading: 'Commands:', rows: [...] }]
   * ```
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
