/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { readdirSync } from 'fs'
import { DirectoryCommandsListFilterFn } from '../Contracts'

export function listDirectoryFiles (
  location: string,
  filterFn?: DirectoryCommandsListFilterFn,
): string[] {
  return readdirSync(location, { withFileTypes: true }).filter((stat) => {
    if (stat.isDirectory()) {
      return false
    }

    if (!stat.name.endsWith('.js')) {
      return false
    }

    if (typeof (filterFn) === 'function') {
      return filterFn(stat)
    }

    return true
  }).map((stat) => {
    return `./${stat.name}`
  })
}
