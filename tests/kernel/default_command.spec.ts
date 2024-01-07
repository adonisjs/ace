/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'

import { Kernel } from '../../src/kernel.js'
import { BaseCommand } from '../../src/commands/base.js'

test.group('Kernel | default command', () => {
  test('use a custom default command', async ({ assert }) => {
    class VerboseHelp extends BaseCommand {
      static commandName = 'help'
    }

    const kernel = new Kernel(VerboseHelp, Kernel.commandExecutor)

    await kernel.boot()
    assert.strictEqual(kernel.getDefaultCommand(), VerboseHelp)
  })
})
