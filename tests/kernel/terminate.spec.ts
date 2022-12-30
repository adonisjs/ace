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
import { CommandsList } from '../../src/loaders/list.js'

test.group('Kernel | terminate', (group) => {
  group.each.teardown(() => {
    process.exitCode = undefined
  })

  test('do not terminate when not in running state', async ({ assert }) => {
    const kernel = new Kernel()
    await kernel.boot()
    await kernel.terminate()

    assert.isUndefined(kernel.exitCode)
    assert.isUndefined(process.exitCode)
    assert.equal(kernel.getState(), 'booted')
  })

  test('do not terminate from a non-main command', async ({ assert }) => {
    const kernel = new Kernel()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {}
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
      async run() {}
    }

    kernel.addLoader(new CommandsList([MakeController, MakeModel]))
    kernel.executed(async () => {
      await kernel.terminate(new MakeModel(kernel, { _: [] }, kernel.ui))
    })
    kernel.executed(async () => {
      assert.equal(kernel.getState(), 'running')
    })

    await kernel.handle(['make:controller'])

    assert.equal(kernel.exitCode, 0)
    assert.equal(process.exitCode, 0)
    assert.equal(kernel.getState(), 'terminated')
  })

  test('terminate from a main command', async ({ assert }) => {
    const kernel = new Kernel()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {}
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
      async run() {}
    }

    kernel.addLoader(new CommandsList([MakeController, MakeModel]))
    kernel.executed(async (command) => {
      await kernel.terminate(command)
    })
    kernel.executed(async () => {
      assert.equal(kernel.getState(), 'terminated')
    })

    await kernel.handle(['make:controller'])

    assert.equal(kernel.exitCode, 0)
    assert.equal(process.exitCode, 0)
    assert.equal(kernel.getState(), 'terminated')
  })
})
