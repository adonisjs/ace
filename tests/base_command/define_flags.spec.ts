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

test.group('Base command | flags', () => {
  test('define flag for the command', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineFlag('connection', { type: 'string' })

    assert.deepEqual(MakeModel.flags, [
      { name: 'connection', required: false, type: 'string', flagName: 'connection' },
    ])
  })

  test('define flag with inheritance', ({ assert }) => {
    class MakeEntity extends BaseCommand {}
    MakeEntity.defineFlag('env', { type: 'string' })

    class MakeModel extends MakeEntity {}
    MakeModel.defineFlag('connection', { type: 'string' })

    class MakeController extends MakeEntity {}
    MakeController.defineFlag('model', { type: 'string' })

    assert.deepEqual(MakeModel.flags, [
      { name: 'env', required: false, type: 'string', flagName: 'env' },
      { name: 'connection', required: false, type: 'string', flagName: 'connection' },
    ])

    assert.deepEqual(MakeController.flags, [
      { name: 'env', required: false, type: 'string', flagName: 'env' },
      { name: 'model', required: false, type: 'string', flagName: 'model' },
    ])
  })

  test('define flag with description', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineFlag('connection', {
      description: 'Db connection to use',
      type: 'string',
    })

    assert.deepEqual(MakeModel.flags, [
      {
        name: 'connection',
        required: false,
        type: 'string',
        description: 'Db connection to use',
        flagName: 'connection',
      },
    ])
  })

  test('make flag required', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineFlag('connection', {
      description: 'Db connection to use',
      type: 'string',
      required: true,
    })

    assert.deepEqual(MakeModel.flags, [
      {
        name: 'connection',
        required: true,
        type: 'string',
        description: 'Db connection to use',
        flagName: 'connection',
      },
    ])
  })

  test('fail when flag type is missing', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    assert.throws(
      // @ts-expect-error
      () => MakeModel.defineFlag('name', {}),
      'Cannot define flag "MakeModel.name". Specify the flag type'
    )
  })
})

test.group('Base command | flags | parserOutput', () => {
  test('define flags for all data types', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineFlag('connection', { type: 'string' })
    MakeModel.defineFlag('dropAll', { type: 'boolean' })
    MakeModel.defineFlag('batchSize', { type: 'number' })
    MakeModel.defineFlag('files', { type: 'array' })

    assert.deepEqual(MakeModel.getParserOptions().flagsParserOptions, {
      all: ['connection', 'drop-all', 'batch-size', 'files'],
      string: ['connection'],
      boolean: ['drop-all'],
      array: ['files'],
      number: ['batch-size'],
      alias: {},
      count: [],
      coerce: {},
      default: {},
    })
  })

  test('define flags aliases', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineFlag('connection', { type: 'string', alias: 'c' })
    MakeModel.defineFlag('dropAll', { type: 'boolean', alias: 'da' })
    MakeModel.defineFlag('batchSize', { type: 'number', alias: ['b', 'bs'] })
    MakeModel.defineFlag('files', { type: 'array', alias: ['ff'] })

    assert.deepEqual(MakeModel.getParserOptions().flagsParserOptions, {
      all: ['connection', 'drop-all', 'batch-size', 'files'],
      string: ['connection'],
      boolean: ['drop-all'],
      array: ['files'],
      number: ['batch-size'],
      alias: {
        'connection': 'c',
        'drop-all': 'da',
        'batch-size': ['b', 'bs'],
        'files': ['ff'],
      },
      count: [],
      coerce: {},
      default: {},
    })
  })

  test('define flag default values', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineFlag('connection', { type: 'string', alias: 'c', default: 'sqlite' })
    MakeModel.defineFlag('dropAll', { type: 'boolean', alias: 'da' })
    MakeModel.defineFlag('batchSize', { type: 'number', alias: ['b', 'bs'], default: 2 })
    MakeModel.defineFlag('files', { type: 'array', alias: ['ff'] })

    assert.deepEqual(MakeModel.getParserOptions().flagsParserOptions, {
      all: ['connection', 'drop-all', 'batch-size', 'files'],
      string: ['connection'],
      boolean: ['drop-all'],
      array: ['files'],
      number: ['batch-size'],
      alias: {
        'connection': 'c',
        'drop-all': 'da',
        'batch-size': ['b', 'bs'],
        'files': ['ff'],
      },
      count: [],
      coerce: {},
      default: {
        'connection': 'sqlite',
        'batch-size': 2,
      },
    })
  })

  test('define parse function for the flags', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineFlag('connection', {
      type: 'string',
      alias: 'c',
      default: 'sqlite',
      parse(input) {
        return input
      },
    })
    MakeModel.defineFlag('dropAll', {
      type: 'boolean',
      alias: 'da',
      parse(input) {
        return input
      },
    })
    MakeModel.defineFlag('batchSize', {
      type: 'number',
      alias: ['b', 'bs'],
      default: 2,
      parse(input) {
        return input
      },
    })
    MakeModel.defineFlag('files', {
      type: 'array',
      alias: ['ff'],
      parse(input) {
        return input
      },
    })

    const coerce = MakeModel.getParserOptions().flagsParserOptions.coerce
    assert.isFunction(coerce['batch-size'])
    assert.isFunction(coerce.connection)
    assert.isFunction(coerce['drop-all'])
    assert.isFunction(coerce['files'])
  })

  test('fail when flag type is missing', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    assert.throws(
      // @ts-expect-error
      () => MakeModel.defineFlag('name', {}),
      'Cannot define flag "MakeModel.name". Specify the flag type'
    )
  })
})
