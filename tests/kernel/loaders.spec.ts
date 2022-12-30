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

test.group('Kernel | loaders', () => {
  test('register commands using a loader', async ({ assert }) => {
    const kernel = new Kernel()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    kernel.addLoader(new CommandsList([MakeController, MakeModel]))
    await kernel.boot()

    assert.deepEqual(kernel.getCommands(), [
      kernel.getDefaultCommand().serialize(),
      MakeController.serialize(),
      MakeModel.serialize(),
    ])
  })

  test('register commands using multiple loaders', async ({ assert }) => {
    const kernel = new Kernel()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    kernel.addLoader(new CommandsList([MakeController]))
    kernel.addLoader(new CommandsList([MakeModel]))
    await kernel.boot()

    assert.deepEqual(kernel.getCommands(), [
      kernel.getDefaultCommand().serialize(),
      MakeController.serialize(),
      MakeModel.serialize(),
    ])
  })

  test('disallow adding a loader after kernel is booted', async ({ assert }) => {
    const kernel = new Kernel()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    kernel.addLoader(new CommandsList([MakeController]))
    await kernel.boot()

    assert.deepEqual(kernel.getCommands(), [
      kernel.getDefaultCommand().serialize(),
      MakeController.serialize(),
    ])

    assert.throws(
      () => kernel.addLoader(new CommandsList([MakeModel])),
      'Cannot add loader in "booted" state'
    )
  })
})
