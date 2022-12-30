/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { args } from '../../src/decorators/args.js'
import { BaseCommand } from '../../src/commands/base.js'

test.group('Decorators | args', () => {
  test('define string argument', ({ assert }) => {
    class MakeModel extends BaseCommand {
      @args.string()
      name!: string
    }

    assert.deepEqual(MakeModel.args, [
      { name: 'name', required: true, type: 'string', argumentName: 'name' },
    ])
  })

  test('define argument with inheritance', ({ assert }) => {
    class MakeEntity extends BaseCommand {
      @args.string()
      name!: string
    }

    class MakeModel extends MakeEntity {
      @args.string()
      dbConnection!: string
    }

    class MakeController extends MakeEntity {
      @args.string()
      resourceName!: string
    }

    assert.deepEqual(MakeModel.args, [
      { name: 'name', required: true, type: 'string', argumentName: 'name' },
      { name: 'dbConnection', required: true, type: 'string', argumentName: 'db-connection' },
    ])

    assert.deepEqual(MakeController.args, [
      { name: 'name', required: true, type: 'string', argumentName: 'name' },
      { name: 'resourceName', required: true, type: 'string', argumentName: 'resource-name' },
    ])
  })
  test('define spread argument', ({ assert }) => {
    class MakeModel extends BaseCommand {
      @args.string()
      name!: string

      @args.spread()
      connections!: string[]
    }

    assert.deepEqual(MakeModel.args, [
      { name: 'name', required: true, type: 'string', argumentName: 'name' },
      {
        name: 'connections',
        required: true,
        type: 'spread',
        argumentName: 'connections',
      },
    ])
  })
})
