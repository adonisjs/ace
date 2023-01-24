/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { BaseCommand } from '../../src/commands/base.js'
import { CommandsList } from '../../src/loaders/list.js'

test.group('Loaders | list', () => {
  test('instantiate loader with commands', async ({ assert }) => {
    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    const loader = new CommandsList([MakeController, MakeModel])
    assert.strictEqual(await loader.getCommand(MakeController.serialize()), MakeController)
    assert.strictEqual(await loader.getCommand(MakeModel.serialize()), MakeModel)
  })

  test('return null when unable to find a command', async ({ assert }) => {
    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    const loader = new CommandsList([MakeModel])
    assert.isNull(await loader.getCommand(MakeController.serialize()))
  })

  test('get metadata for registered commands', async ({ assert }) => {
    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
    }

    class MakeModel extends BaseCommand {
      static commandName = 'make:model'
    }

    const loader = new CommandsList([MakeController, MakeModel])
    assert.deepEqual(await loader.getMetaData(), [
      MakeController.serialize(),
      MakeModel.serialize(),
    ])
  })
})
