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

test.group('Kernel | boot', () => {
  test('load commands from loader during boot phase', async ({ assert }) => {
    const kernel = new Kernel()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    kernel.addLoader(new ListLoader([MakeController, MakeModel]))
    await kernel.boot()

    assert.deepEqual(kernel.getCommands(), [
      kernel.getDefaultCommand().serialize(),
      MakeController.serialize(),
      MakeModel.serialize(),
    ])
  })

  test('multiple calls to boot method should be a noop', async ({ assert }) => {
    const kernel = new Kernel()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    kernel.addLoader(new ListLoader([MakeController, MakeModel]))
    await kernel.boot()
    await kernel.boot()
    await kernel.boot()

    assert.deepEqual(kernel.getState(), 'booted')
    assert.deepEqual(kernel.getCommands(), [
      kernel.getDefaultCommand().serialize(),
      MakeController.serialize(),
      MakeModel.serialize(),
    ])
  })

  test('collect namespaces from the loaded commands', async ({ assert }) => {
    const kernel = new Kernel()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    class MigrationRun extends BaseCommand {
      static commandName = 'migration:run'
    }

    kernel.addLoader(new ListLoader([MakeController, MakeModel, MigrationRun]))
    await kernel.boot()

    assert.deepEqual(kernel.getNamespaces(), ['make', 'migration'])
  })

  test('collect command aliases', async ({ assert }) => {
    const kernel = new Kernel()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      static aliases: string[] = ['mc']
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
      static aliases: string[] = ['mm']
    }

    class MigrationRun extends BaseCommand {
      static commandName = 'migration:run'
      static aliases: string[] = ['migrate']
    }

    kernel.addLoader(new ListLoader([MakeController, MakeModel, MigrationRun]))
    await kernel.boot()

    assert.deepEqual(kernel.getAliases(), ['mc', 'mm', 'migrate'])
  })
})
