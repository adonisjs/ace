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
    const kernel = new Kernel()

    class VerboseHelp extends BaseCommand {
      static commandName = 'help'
    }

    kernel.registerDefaultCommand(VerboseHelp)

    await kernel.boot()
    assert.strictEqual(kernel.getDefaultCommand(), VerboseHelp)
  })

  test('disallow registering default command after kernel is booted', async ({ assert }) => {
    const kernel = new Kernel()
    await kernel.boot()

    class VerboseHelp extends BaseCommand {
      static commandName = 'help'
    }

    assert.throws(
      () => kernel.registerDefaultCommand(VerboseHelp),
      'Cannot register default command in "booted" state'
    )
  })
})
