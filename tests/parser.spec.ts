/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Parser } from '../src/parser.js'
import { BaseCommand } from '../src/commands/base.js'

test.group('Parser | flags', () => {
  test('parse flags for all datatypes', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineFlag('connection', { type: 'string' })
    MakeModel.defineFlag('dropAll', { type: 'boolean' })
    MakeModel.defineFlag('batchSize', { type: 'number' })
    MakeModel.defineFlag('files', { type: 'array' })

    assert.deepEqual(
      new Parser(MakeModel.getParserOptions()).parse(
        '--connection=sqlite --drop-all --batch-size=1 --files=a,b'
      ),
      {
        _: [],
        args: [],
        unknownFlags: [],
        flags: {
          'batch-size': 1,
          'connection': 'sqlite',
          'drop-all': true,
          'files': ['a,b'],
        },
      }
    )

    assert.deepEqual(new Parser(MakeModel.getParserOptions()).parse('--files=a --files=b'), {
      _: [],
      args: [],
      unknownFlags: [],
      flags: {
        files: ['a', 'b'],
      },
    })
  })

  test('parse flags using aliases', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineFlag('connection', { type: 'string', alias: 'c' })
    MakeModel.defineFlag('dropAll', { type: 'boolean', alias: 'd' })
    MakeModel.defineFlag('batchSize', { type: 'number', alias: 'b' })
    MakeModel.defineFlag('files', { type: 'array', alias: 'f' })

    assert.deepEqual(new Parser(MakeModel.getParserOptions()).parse('-c=sqlite -d -b=1 -f=a,b'), {
      _: [],
      args: [],
      unknownFlags: [],
      flags: {
        'batch-size': 1,
        'connection': 'sqlite',
        'drop-all': true,
        'files': ['a,b'],
      },
    })

    assert.deepEqual(new Parser(MakeModel.getParserOptions()).parse('-f=a -f=b'), {
      _: [],
      args: [],
      unknownFlags: [],
      flags: {
        files: ['a', 'b'],
      },
    })
  })

  test('do not set flag when not mentioned', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineFlag('dropAll', { type: 'boolean' })
    MakeModel.defineFlag('connection', { type: 'string' })
    MakeModel.defineFlag('batchSize', { type: 'number' })
    MakeModel.defineFlag('files', { type: 'array' })

    const output = new Parser(MakeModel.getParserOptions()).parse('')
    assert.deepEqual(output, {
      _: [],
      args: [],
      unknownFlags: [],
      flags: {},
    })
  })

  test('set flags to default values when not mentioned', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineFlag('dropAll', { type: 'boolean', default: false })
    MakeModel.defineFlag('connection', { type: 'string', default: 'sqlite' })
    MakeModel.defineFlag('batchSize', { type: 'number', default: 1 })
    MakeModel.defineFlag('files', { type: 'array' })

    const output = new Parser(MakeModel.getParserOptions()).parse('')
    assert.deepEqual(output, {
      _: [],
      args: [],
      unknownFlags: [],
      flags: {
        'batch-size': 1,
        'drop-all': false,
        'connection': 'sqlite',
      },
    })
  })

  test('set flags to default values when mentioned with no value', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineFlag('dropAll', { type: 'boolean', default: false })
    MakeModel.defineFlag('connection', { type: 'string', default: 'sqlite' })
    MakeModel.defineFlag('batchSize', { type: 'number', default: 1 })
    MakeModel.defineFlag('files', { type: 'array', default: ['a.txt'] })

    const output = new Parser(MakeModel.getParserOptions()).parse(
      '--connection --batch-size --files'
    )

    assert.deepEqual(output, {
      _: [],
      args: [],
      unknownFlags: [],
      flags: {
        'batch-size': 1,
        'drop-all': false,
        'connection': 'sqlite',
        'files': ['a.txt'],
      },
    })
  })

  test('parse flags using the parse method', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineFlag('dropAll', {
      type: 'boolean',
      default: false,
      parse(value) {
        return value ? 1 : 0
      },
    })
    MakeModel.defineFlag('connection', {
      type: 'string',
      default: 'DEFAULT_CONN',
      parse(value) {
        return value === 'DEFAULT_CONN' ? 'sqlite' : value
      },
    })
    MakeModel.defineFlag('batchSize', {
      type: 'number',
      default: 1,
      parse(value) {
        return Number.isNaN(value) ? 1 : value
      },
    })
    MakeModel.defineFlag('files', {
      type: 'array',
      default: [],
      parse(value) {
        return value
      },
    })

    const output = new Parser(MakeModel.getParserOptions()).parse(
      '--batch-size=1 --connection=mysql --drop-all --files'
    )

    assert.deepEqual(output, {
      _: [],
      args: [],
      unknownFlags: [],
      flags: {
        'batch-size': 1,
        'drop-all': 1,
        'connection': 'mysql',
        'files': [],
      },
    })
  })

  test('call parse method for default values', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineFlag('dropAll', {
      type: 'boolean',
      default: false,
      parse(value) {
        return value ? 1 : 0
      },
    })
    MakeModel.defineFlag('connection', {
      type: 'string',
      default: 'DEFAULT_CONN',
      parse(value) {
        return value === 'DEFAULT_CONN' ? 'sqlite' : value
      },
    })
    MakeModel.defineFlag('batchSize', {
      type: 'number',
      default: 1,
      parse(value) {
        return Number.isNaN(value) ? 1 : value
      },
    })
    MakeModel.defineFlag('files', {
      type: 'array',
      default: [],
      parse(value) {
        return value
      },
    })

    const output = new Parser(MakeModel.getParserOptions()).parse('--batch-size')
    assert.deepEqual(output, {
      _: [],
      args: [],
      unknownFlags: [],
      flags: {
        'batch-size': 1,
        'drop-all': 0,
        'connection': 'sqlite',
        'files': [],
      },
    })
  })

  test('do not call parse method when flags are not mentioned', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineFlag('dropAll', {
      type: 'boolean',
      parse(value) {
        return value ? 1 : 0
      },
    })
    MakeModel.defineFlag('files', {
      type: 'array',
      parse(value) {
        return value
      },
    })

    const output = new Parser(MakeModel.getParserOptions()).parse('')
    assert.deepEqual(output, {
      _: [],
      args: [],
      unknownFlags: [],
      flags: {},
    })
  })

  test('detect unknown flags', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineFlag('connection', { type: 'string' })

    const output = new Parser(MakeModel.getParserOptions()).parse(
      '--connection=sqlite --foo --bar=baz'
    )

    assert.deepEqual(output, {
      _: [],
      args: [],
      unknownFlags: ['foo', 'bar'],
      flags: {
        foo: true,
        bar: 'baz',
        connection: 'sqlite',
      },
    })
  })
})

test.group('Parser | arguments', () => {
  test('parse arguments for all datatypes', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineArgument('name', { type: 'string' })
    MakeModel.defineArgument('connections', { type: 'spread' })

    const output = new Parser(MakeModel.getParserOptions()).parse('user sqlite mysql pg')
    assert.deepEqual(output, {
      _: [],
      args: ['user', ['sqlite', 'mysql', 'pg']],
      unknownFlags: [],
      flags: {},
    })
  })

  test('use default value when argument is not mentioned', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineArgument('name', { type: 'string' })
    MakeModel.defineArgument('connections', { type: 'spread', default: ['sqlite'] })

    const output = new Parser(MakeModel.getParserOptions()).parse('user')
    assert.deepEqual(output, {
      _: [],
      args: ['user', ['sqlite']],
      unknownFlags: [],
      flags: {},
    })
  })

  test('do not use default value when argument is mentioned as empty string', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineArgument('name', { type: 'string' })
    MakeModel.defineArgument('connections', { type: 'spread', default: ['sqlite'] })

    const output = new Parser(MakeModel.getParserOptions()).parse(['user', ''])
    assert.deepEqual(output, {
      _: [],
      args: ['user', ['']],
      unknownFlags: [],
      flags: {},
    })
  })

  test('call parse method', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineArgument('name', {
      type: 'string',
      parse(value) {
        return value.toUpperCase()
      },
    })
    MakeModel.defineArgument('connections', {
      type: 'spread',
      parse(values) {
        return values.map((value: string) => value.toUpperCase())
      },
    })

    const output = new Parser(MakeModel.getParserOptions()).parse(['user', 'sqlite', 'pg'])
    assert.deepEqual(output, {
      _: [],
      args: ['USER', ['SQLITE', 'PG']],
      unknownFlags: [],
      flags: {},
    })
  })

  test('call parse method on default value', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineArgument('name', {
      type: 'string',
      default: 'post',
      parse(value) {
        return value.toUpperCase()
      },
    })
    MakeModel.defineArgument('connections', {
      type: 'spread',
      default: ['sqlite'],
      parse(values) {
        return values.map((value: string) => value.toUpperCase())
      },
    })

    const output = new Parser(MakeModel.getParserOptions()).parse([])
    assert.deepEqual(output, {
      _: [],
      args: ['POST', ['SQLITE']],
      unknownFlags: [],
      flags: {},
    })
  })

  test('do not call parse when value is undefined', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineArgument('name', {
      type: 'string',
      parse(value) {
        return value.toUpperCase()
      },
    })
    MakeModel.defineArgument('connections', {
      type: 'spread',
      parse(values) {
        return values.map((value: string) => value.toUpperCase())
      },
    })

    const output = new Parser(MakeModel.getParserOptions()).parse([])
    assert.deepEqual(output, {
      _: [],
      args: [undefined, undefined],
      unknownFlags: [],
      flags: {},
    })
  })

  test('cast spread default value to array', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineArgument('name', {
      type: 'string',
    })
    MakeModel.defineArgument('connections', {
      type: 'spread',
      default: 1,
    })

    const output = new Parser(MakeModel.getParserOptions()).parse([])
    assert.deepEqual(output, {
      _: [],
      args: [undefined, [1]],
      unknownFlags: [],
      flags: {},
    })
  })

  test('define different data type for string default value', ({ assert }) => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineArgument('name', {
      type: 'string',
      default: null,
    })
    MakeModel.defineArgument('connections', {
      type: 'spread',
      default: 1,
    })

    const output = new Parser(MakeModel.getParserOptions()).parse([])
    assert.deepEqual(output, {
      _: [],
      args: [null, [1]],
      unknownFlags: [],
      flags: {},
    })
  })
})
