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
import { Generator } from '../src/Generator'

const fs = new Filesystem(join(__dirname, './app'))

test.group('Generator', (group) => {
  group.after(async () => {
    await fs.cleanup()
  })

  test('generate one or more entity files', async (assert) => {
    const generator = new Generator(fs.basePath)
    generator.addFile('user', { suffix: 'controller' })
    generator.addFile('account', { suffix: 'controller' })

    await generator.run()

    const userExists = await fs.fsExtra.pathExists(join(fs.basePath, 'UserController.ts'))
    const accountExists = await fs.fsExtra.pathExists(join(fs.basePath, 'UserController.ts'))

    assert.isTrue(userExists)
    assert.isTrue(accountExists)
  })

  test('do not overwrite existing files', async (assert) => {
    const generator = new Generator(fs.basePath)
    await fs.add('UserController.ts', `export const greeting = 'hello world'`)

    generator.addFile('user', { suffix: 'controller' })
    await generator.run()

    const user = await fs.get('UserController.ts')
    assert.equal(user, `export const greeting = 'hello world'`)
  })
})
