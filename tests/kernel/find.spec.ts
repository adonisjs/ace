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
import { CommandMetaData } from '../../src/types.js'

test.group('Kernel | find', () => {
  test('find commands registered using a loader', async ({ assert }) => {
    const kernel = Kernel.create()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    kernel.addLoader(new ListLoader([MakeController, MakeModel]))
    await kernel.boot()

    const command = await kernel.find('make:controller')
    assert.strictEqual(command, MakeController)
  })

  test('find command using the command alias', async ({ assert }) => {
    const kernel = Kernel.create()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      static aliases: string[] = ['mc']
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    kernel.addLoader(new ListLoader([MakeController, MakeModel]))
    kernel.addAlias('controller', 'make:controller')
    await kernel.boot()

    assert.strictEqual(await kernel.find('mc'), MakeController)
    assert.strictEqual(await kernel.find('controller'), MakeController)
  })

  test('find command using the command alias with flags', async ({ assert }) => {
    const kernel = Kernel.create()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    kernel.addLoader(new ListLoader([MakeController, MakeModel]))
    kernel.addAlias('controller', 'make:controller --resource')
    await kernel.boot()

    assert.strictEqual(await kernel.find('controller'), MakeController)
  })

  test('raise error when unable to find command', async ({ assert }) => {
    const kernel = Kernel.create()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      static aliases: string[] = ['mc']
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    kernel.addLoader(new ListLoader([MakeController, MakeModel]))
    await kernel.boot()

    await assert.rejects(() => kernel.find('foo'), 'Command "foo" is not defined')
  })

  test('raise error when loader is not able to lookup command', async ({ assert }) => {
    const kernel = Kernel.create()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      static aliases: string[] = ['mc']
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    class CustomLoader extends ListLoader<typeof BaseCommand> {
      async getCommand(_: CommandMetaData): Promise<typeof BaseCommand | null> {
        return null
      }
    }

    kernel.addLoader(new CustomLoader([MakeController, MakeModel]))
    await kernel.boot()

    await assert.rejects(() => kernel.find('make:model'), 'Command "make:model" is not defined')
  })

  test('find command when using multiple loaders', async ({ assert }) => {
    const kernel = Kernel.create()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      static aliases: string[] = ['mc']
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    kernel.addLoader(new ListLoader([MakeController]))
    kernel.addLoader(new ListLoader([MakeModel]))
    await kernel.boot()

    const command = await kernel.find('make:model')
    assert.strictEqual(command, MakeModel)
  })

  test('execute finding, loading and loaded hooks', async ({ assert }) => {
    const kernel = Kernel.create()
    const stack: string[] = []

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      static aliases: string[] = ['mc']
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    kernel.addLoader(new ListLoader([MakeController]))
    kernel.addLoader(new ListLoader([MakeModel]))
    await kernel.boot()

    kernel.finding((commandName) => {
      assert.equal(commandName, 'make:model')
      stack.push('finding')
    })

    kernel.loading((command) => {
      assert.deepEqual(command, MakeModel.serialize())
      stack.push('loading')
    })

    kernel.loaded((command) => {
      assert.strictEqual(command, MakeModel)
      stack.push('loaded')
    })

    const command = await kernel.find('make:model')

    assert.strictEqual(command, MakeModel)
    assert.deepEqual(stack, ['finding', 'loading', 'loaded'])
  })

  test('do not execute loading hook when command not found', async ({ assert }) => {
    const kernel = Kernel.create()
    const stack: string[] = []

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      static aliases: string[] = ['mc']
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    kernel.addLoader(new ListLoader([MakeController]))
    kernel.addLoader(new ListLoader([MakeModel]))
    await kernel.boot()

    kernel.finding((commandName) => {
      assert.equal(commandName, 'foo')
      stack.push('finding')
    })

    kernel.loading(() => {
      stack.push('found')
    })

    await assert.rejects(() => kernel.find('foo'), 'Command "foo" is not defined')
    assert.deepEqual(stack, ['finding'])
  })
})
