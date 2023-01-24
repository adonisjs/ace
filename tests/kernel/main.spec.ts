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
import { ListCommand } from '../../src/commands/list.js'

test.group('Kernel', () => {
  test('get alphabetically sorted list of commands', async ({ assert }) => {
    const kernel = new Kernel()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    kernel.addLoader(new ListLoader([MakeModel, MakeController]))
    await kernel.boot()

    const commands = kernel.getCommands()
    assert.deepEqual(
      commands.map(({ commandName }) => commandName),
      ['list', 'make:controller', 'make:model']
    )
  })

  test('get alphabetically sorted list of namespaces', async ({ assert }) => {
    const kernel = new Kernel()

    class ListRoutes extends BaseCommand {
      static commandName = 'list:routes'
    }

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    kernel.addLoader(new ListLoader([MakeModel, MakeController, ListRoutes]))
    await kernel.boot()

    assert.deepEqual(kernel.getNamespaces(), ['list', 'make'])
  })

  test('get list of commands for a given namespace', async ({ assert }) => {
    const kernel = new Kernel()

    class ListRoutes extends BaseCommand {
      static commandName = 'list:routes'
    }

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    kernel.addLoader(new ListLoader([MakeModel, MakeController, ListRoutes]))
    await kernel.boot()

    assert.deepEqual(
      kernel.getNamespaceCommands('make').map(({ commandName }) => commandName),
      ['make:controller', 'make:model']
    )

    assert.deepEqual(
      kernel.getNamespaceCommands('list').map(({ commandName }) => commandName),
      ['list:routes']
    )
  })

  test('get list of top level commands without a namespace', async ({ assert }) => {
    const kernel = new Kernel()

    class Migrate extends BaseCommand {
      static commandName = 'migrate'
    }

    class ListRoutes extends BaseCommand {
      static commandName = 'list:routes'
    }

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    kernel.addLoader(new ListLoader([MakeModel, MakeController, ListRoutes, Migrate]))
    await kernel.boot()

    assert.deepEqual(
      kernel.getNamespaceCommands().map(({ commandName }) => commandName),
      ['list', 'migrate']
    )
  })

  test('get an array of registered aliases', async ({ assert }) => {
    const kernel = new Kernel()

    class Migrate extends BaseCommand {
      static commandName = 'migrate'
      static aliases: string[] = ['migration:run']
    }

    class ListRoutes extends BaseCommand {
      static commandName = 'list:routes'
    }

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    kernel.addLoader(new ListLoader([MakeModel, MakeController, ListRoutes, Migrate]))
    kernel.addAlias('mc', 'make:controller')
    kernel.addAlias('mm', 'make:model')
    await kernel.boot()

    assert.deepEqual(kernel.getAliases(), ['mc', 'mm', 'migration:run'])
  })

  test('get aliases for a given command', async ({ assert }) => {
    const kernel = new Kernel()

    class Migrate extends BaseCommand {
      static commandName = 'migrate'
      static aliases: string[] = ['migration:run']
    }

    class ListRoutes extends BaseCommand {
      static commandName = 'list:routes'
    }

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    kernel.addLoader(new ListLoader([MakeModel, MakeController, ListRoutes, Migrate]))
    kernel.addAlias('mc', 'make:controller')
    kernel.addAlias('mm', 'make:model')
    await kernel.boot()

    assert.deepEqual(kernel.getCommandAliases('migrate'), ['migration:run'])
    assert.deepEqual(kernel.getCommandAliases('make:controller'), ['mc'])
  })

  test('get command for an alias', async ({ assert }) => {
    const kernel = new Kernel()

    class Migrate extends BaseCommand {
      static commandName = 'migrate'
      static aliases: string[] = ['migration:run']
    }

    class ListRoutes extends BaseCommand {
      static commandName = 'list:routes'
    }

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    kernel.addLoader(new ListLoader([MakeModel, MakeController, ListRoutes, Migrate]))
    kernel.addAlias('mc', 'make:controller')
    kernel.addAlias('mm', 'unrecognized:command')
    await kernel.boot()

    assert.deepEqual(kernel.getAliasCommand('mc')?.commandName, 'make:controller')
    assert.isNull(kernel.getAliasCommand('mm'))
    assert.isNull(kernel.getAliasCommand('foo'))
  })

  test('get command metadata', async ({ assert }) => {
    const kernel = new Kernel()

    class Migrate extends BaseCommand {
      static commandName = 'migrate'
    }

    kernel.addLoader(new ListLoader([Migrate]))
    await kernel.boot()

    assert.deepEqual(kernel.getCommand('migrate'), Migrate.serialize())
    assert.isNull(kernel.getCommand('migration:run'))
  })

  test('get the default command', async ({ assert }) => {
    const kernel = new Kernel()
    await kernel.boot()

    assert.strictEqual(kernel.getDefaultCommand(), ListCommand)
  })

  test('get commands suggestions for a given keyword', async ({ assert }) => {
    const kernel = new Kernel()

    class Migrate extends BaseCommand {
      static commandName = 'migration:run'
    }

    class ListRoutes extends BaseCommand {
      static commandName = 'list:routes'
    }

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    kernel.addLoader(new ListLoader([MakeModel, MakeController, ListRoutes, Migrate]))
    kernel.addAlias('mc', 'make:controller')
    kernel.addAlias('mm', 'unrecognized:command')
    await kernel.boot()

    assert.deepEqual(kernel.getCommandSuggestions('controller'), ['make:controller'])
    assert.deepEqual(kernel.getCommandSuggestions('migrate'), ['migration:run'])
  })

  test('get commands suggestions for a namespace', async ({ assert }) => {
    const kernel = new Kernel()

    class Migrate extends BaseCommand {
      static commandName = 'migration:run'
    }

    class ListRoutes extends BaseCommand {
      static commandName = 'list:routes'
    }

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    kernel.addLoader(new ListLoader([MakeModel, MakeController, ListRoutes, Migrate]))
    kernel.addAlias('mc', 'make:controller')
    kernel.addAlias('mm', 'unrecognized:command')
    await kernel.boot()

    assert.deepEqual(kernel.getCommandSuggestions('make'), ['make:controller', 'make:model'])
  })

  test('get namespaces suggestions for a given keyword', async ({ assert }) => {
    const kernel = new Kernel()

    class Migrate extends BaseCommand {
      static commandName = 'migration:run'
    }

    class ListRoutes extends BaseCommand {
      static commandName = 'list:routes'
    }

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    kernel.addLoader(new ListLoader([MakeModel, MakeController, ListRoutes, Migrate]))
    kernel.addAlias('mc', 'make:controller')
    await kernel.boot()

    assert.deepEqual(kernel.getNamespaceSuggestions('migrate'), ['migration'])
  })
})
