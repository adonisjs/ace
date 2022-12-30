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

test.group('Base command | serialize', () => {
  test('serialize command', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    assert.deepEqual(MakeModel.serialize(), {
      commandName: 'migrate',
      namespace: null,
      description: 'Migrate db',
      help: '',
      args: [],
      flags: [],
      aliases: [],
      options: {
        allowUnknownFlags: false,
        handlesSignals: false,
        staysAlive: false,
      },
    })
  })

  test('serialize command with namespaced name', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'make:model'
      static description: string = 'Make a new model'
    }

    assert.deepEqual(MakeModel.serialize(), {
      commandName: 'make:model',
      namespace: 'make',
      description: 'Make a new model',
      help: '',
      args: [],
      flags: [],
      aliases: [],
      options: {
        allowUnknownFlags: false,
        handlesSignals: false,
        staysAlive: false,
      },
    })
  })

  test('serialize command with args', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'make:model'
      static description: string = 'Make a new model'
    }

    MakeModel.defineArgument('name', { type: 'string', description: 'Name of the argument' })

    assert.deepEqual(MakeModel.serialize(), {
      commandName: 'make:model',
      namespace: 'make',
      description: 'Make a new model',
      help: '',
      args: [
        {
          name: 'name',
          argumentName: 'name',
          required: true,
          type: 'string',
          description: 'Name of the argument',
        },
      ],
      flags: [],
      aliases: [],
      options: {
        allowUnknownFlags: false,
        handlesSignals: false,
        staysAlive: false,
      },
    })
  })

  test('serialize command with flags', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'make:model'
      static description: string = 'Make a new model'
    }

    MakeModel.defineArgument('name', { type: 'string', description: 'Name of the argument' })
    MakeModel.defineFlag('verbose', { type: 'boolean' })

    assert.deepEqual(MakeModel.serialize(), {
      commandName: 'make:model',
      namespace: 'make',
      help: '',
      description: 'Make a new model',
      args: [
        {
          name: 'name',
          argumentName: 'name',
          required: true,
          type: 'string',
          description: 'Name of the argument',
        },
      ],
      flags: [
        {
          name: 'verbose',
          flagName: 'verbose',
          required: false,
          type: 'boolean',
        },
      ],
      options: {
        allowUnknownFlags: false,
        handlesSignals: false,
        staysAlive: false,
      },
      aliases: [],
    })
  })

  test('error when command does not have a name', ({ assert }) => {
    class MakeModel extends BaseCommand {}

    assert.throws(
      () => MakeModel.serialize(),
      'Cannot serialize command "MakeModel". Missing static property "commandName"'
    )
  })
})
