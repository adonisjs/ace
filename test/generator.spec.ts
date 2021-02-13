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

import { Generator } from '../src/Generator'
import { BaseCommand } from '../src/BaseCommand'
import { setupApp, fs, getKernel } from '../test-helpers'

class GeneratorCommand extends BaseCommand {
  public async handle() {}
}

test.group('Generator', (group) => {
  group.after(async () => {
    await fs.cleanup()
  })

  test('generate one or more entity files', async (assert) => {
    const app = setupApp()
    const kernel = getKernel(app)

    const generator = new Generator(new GeneratorCommand(app, kernel), fs.basePath)
    generator.addFile('user', { suffix: 'controller', pattern: 'pascalcase' })
    generator.addFile('account', { suffix: 'controller', pattern: 'pascalcase' })

    await generator.run()

    const userExists = await fs.fsExtra.pathExists(join(fs.basePath, 'UserController.ts'))
    const accountExists = await fs.fsExtra.pathExists(join(fs.basePath, 'UserController.ts'))

    assert.isTrue(userExists)
    assert.isTrue(accountExists)
  })

  test('do not overwrite existing files', async (assert) => {
    const app = setupApp()
    const kernel = getKernel(app)

    const generator = new Generator(new GeneratorCommand(app, kernel), fs.basePath)
    await fs.add('UserController.ts', "export const greeting = 'hello world'")

    generator.addFile('user', { suffix: 'controller' })
    await generator.run()

    const user = await fs.get('UserController.ts')
    assert.equal(user, "export const greeting = 'hello world'")
  })
})
