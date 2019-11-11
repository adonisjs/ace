/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import test from 'japa'
import { join } from 'path'
import { Filesystem } from '@poppinss/dev-utils'
import { listDirectoryFiles } from '../src/utils/listDirectoryFiles'

const fs = new Filesystem(join(__dirname, './app'))

test.group('listDirectoryFiles', (group) => {
  group.after(async () => {
    await fs.cleanup()
  })

  test('get a list of javascript files from a given directory', async (assert) => {
    await fs.add('foo.js', '')
    await fs.add('bar.js', '')
    await fs.add('baz.js', '')
    await fs.add('README.md', '')
    await fs.add('.gitkeep', '')

    const directories = listDirectoryFiles(fs.basePath)
    assert.deepEqual(directories, ['./bar.js', './baz.js', './foo.js'])
  })

  test('allow inline files filter', async (assert) => {
    await fs.add('foo.js', '')
    await fs.add('bar.js', '')
    await fs.add('baz.js', '')
    await fs.add('README.md', '')
    await fs.add('.gitkeep', '')

    const directories = listDirectoryFiles(fs.basePath, (stat) => {
      return stat.name !== 'baz.js'
    })
    assert.deepEqual(directories, ['./bar.js', './foo.js'])
  })
})
