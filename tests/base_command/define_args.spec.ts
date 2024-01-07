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

test.group('Base command | arguments', () => {
  test('define argument for the command', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineArgument('name', { type: 'string' })

    assert.deepEqual(MakeModel.args, [
      { name: 'name', required: true, type: 'string', argumentName: 'name' },
    ])
  })

  test('define argument with inheritance', ({ assert }) => {
    class MakeEntity extends BaseCommand {}
    MakeEntity.defineArgument('name', { type: 'string' })

    class MakeModel extends MakeEntity {}
    MakeModel.defineArgument('dbConnection', { type: 'string' })

    class MakeController extends MakeEntity {}
    MakeController.defineArgument('resourceName', { type: 'string' })

    assert.deepEqual(MakeModel.args, [
      { name: 'name', required: true, type: 'string', argumentName: 'name' },
      { name: 'dbConnection', required: true, type: 'string', argumentName: 'db-connection' },
    ])

    assert.deepEqual(MakeController.args, [
      { name: 'name', required: true, type: 'string', argumentName: 'name' },
      { name: 'resourceName', required: true, type: 'string', argumentName: 'resource-name' },
    ])
  })

  test('define arguments with description', ({ assert }) => {
    class MakeEntity extends BaseCommand {}
    MakeEntity.defineArgument('name', { description: 'The name of the entity', type: 'string' })

    class MakeModel extends MakeEntity {}
    MakeModel.defineArgument('dbConnection', {
      description: 'Db connection to use',
      type: 'string',
    })

    class MakeController extends MakeEntity {}
    MakeController.defineArgument('resourceName', {
      description: 'The resource name',
      type: 'string',
    })

    assert.deepEqual(MakeModel.args, [
      {
        name: 'name',
        required: true,
        type: 'string',
        description: 'The name of the entity',
        argumentName: 'name',
      },
      {
        name: 'dbConnection',
        required: true,
        type: 'string',
        description: 'Db connection to use',
        argumentName: 'db-connection',
      },
    ])
    assert.deepEqual(MakeController.args, [
      {
        name: 'name',
        required: true,
        type: 'string',
        description: 'The name of the entity',
        argumentName: 'name',
      },
      {
        name: 'resourceName',
        required: true,
        type: 'string',
        description: 'The resource name',
        argumentName: 'resource-name',
      },
    ])
  })

  test('fail when adding required argument after optional argument', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineArgument('name', { type: 'string' })
    MakeModel.defineArgument('connection', { required: false, type: 'string' })

    assert.throws(
      () => MakeModel.defineArgument('resourceName', { type: 'string' }),
      'Cannot define required argument "MakeModel.resourceName" after optional argument "MakeModel.connection"'
    )
  })

  test('define spread argument', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineArgument('name', { type: 'string' })
    MakeModel.defineArgument('connections', { type: 'spread' })

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

  test('fail when adding standard argument after the spread argument', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineArgument('connections', { type: 'spread' })

    assert.throws(
      () => MakeModel.defineArgument('name', { type: 'string' }),
      'Cannot define argument "MakeModel.name" after spread argument "MakeModel.connections". Spread argument should be the last one'
    )
  })

  test('fail when argument type is missing', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    assert.throws(
      // @ts-expect-error
      () => MakeModel.defineArgument('name', {}),
      'Cannot define argument "MakeModel.name". Specify the argument type'
    )
  })
})

test.group('Base command | arguments | parserOutput', () => {
  test('define parse function for the arguments', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineArgument('name', {
      type: 'string',
      parse(input) {
        return input
      },
    })
    MakeModel.defineArgument('connections', {
      type: 'spread',
      parse(input) {
        return input
      },
    })

    const options = MakeModel.getParserOptions().argumentsParserOptions
    assert.isFunction(options[0].parse)
    assert.isFunction(options[1].parse)
  })
})
