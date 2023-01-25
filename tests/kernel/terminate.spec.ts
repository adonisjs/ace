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
import { ListLoader } from '../../src/loaders/list_loader.js'

test.group('Kernel | terminate', (group) => {
  group.each.teardown(() => {
    process.exitCode = undefined
  })

  test('do not terminate when not in running state', async ({ assert }) => {
    const kernel = Kernel.create()
    await kernel.boot()
    await kernel.terminate()

    assert.isUndefined(kernel.exitCode)
    assert.isUndefined(process.exitCode)
    assert.equal(kernel.getState(), 'booted')
  })

  test('do not terminate from a non-main command', async ({ assert }) => {
    const kernel = Kernel.create()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {}
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
      async run() {}
    }

    kernel.addLoader(new ListLoader([MakeController, MakeModel]))
    kernel.executed(async () => {
      await kernel.terminate(
        new MakeModel(
          kernel,
          { args: [], _: [], flags: {}, unknownFlags: [] },
          kernel.ui,
          kernel.prompt
        )
      )
    })
    kernel.executed(async () => {
      assert.equal(kernel.getState(), 'running')
    })

    await kernel.handle(['make:controller'])

    assert.equal(kernel.exitCode, 0)
    assert.equal(process.exitCode, 0)
    assert.equal(kernel.getState(), 'terminated')
  })

  test('terminate automatically after running the main command', async ({ assert }) => {
    const kernel = Kernel.create()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {}
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
      async run() {}
    }

    kernel.addLoader(new ListLoader([MakeController, MakeModel]))
    await kernel.handle(['make:controller'])

    assert.equal(kernel.exitCode, 0)
    assert.equal(process.exitCode, 0)
    assert.equal(kernel.getState(), 'terminated')
  })

  test('do not terminate if command options.staysAlive is true', async ({ assert }) => {
    const kernel = Kernel.create()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      static options = {
        staysAlive: true,
      }
      async run() {}
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
      async run() {}
    }

    kernel.addLoader(new ListLoader([MakeController, MakeModel]))
    await kernel.handle(['make:controller'])

    assert.isUndefined(kernel.exitCode)
    assert.isUndefined(process.exitCode)
    assert.equal(kernel.getState(), 'running')
  })

  test('terminate when alive command calls terminate method', async ({ assert }) => {
    const kernel = Kernel.create()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      static options = {
        staysAlive: true,
      }
      async run() {
        await this.terminate()
      }
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
      async run() {}
    }

    kernel.addLoader(new ListLoader([MakeController, MakeModel]))
    await kernel.handle(['make:controller'])

    assert.equal(kernel.exitCode, 0)
    assert.equal(process.exitCode, 0)
    assert.equal(kernel.getState(), 'terminated')
  })

  test('terminate from flag listener', async ({ assert }) => {
    const kernel = Kernel.create()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      static options = {
        staysAlive: true,
      }
      async run() {}
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
      async run() {}
    }

    kernel.addLoader(new ListLoader([MakeController, MakeModel]))
    kernel.defineFlag('help', {
      type: 'boolean',
    })

    kernel.on('help', () => {
      return true
    })

    await kernel.handle(['make:controller', '--help'])

    assert.equal(kernel.exitCode, 0)
    assert.equal(process.exitCode, 0)
    assert.equal(kernel.getState(), 'terminated')
  })
})
