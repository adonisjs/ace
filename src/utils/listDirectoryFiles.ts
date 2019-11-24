/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { join, relative } from 'path'
import readdirSync from 'fs-readdir-recursive'
import { CommandsListFilterFn } from '../Contracts'

/**
 * Returns an array of Javascript files inside the current directory in
 * relative to the application root.
 */
export function listDirectoryFiles (
  scanDirectory: string,
  appRoot: string,
  filterFn?: CommandsListFilterFn,
): string[] {
  return readdirSync(scanDirectory, (name) => name.endsWith('.js'))
    .map((name) => {
      const relativePath = relative(appRoot, join(scanDirectory, name))
      return relativePath.startsWith('../') ? relativePath : `./${relativePath}`
    })
    .filter((name) => {
      if (typeof (filterFn) === 'function') {
        return filterFn(name)
      }

      return Array.isArray(filterFn) ? !filterFn.includes(name) : true
    })
}
