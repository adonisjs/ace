/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import test from 'japa'

import { Parser } from '../src/Parser'
import { args } from '../src/Decorators/args'
import { BaseCommand } from '../src/BaseCommand'

test.group('Parser | flags', () => {
  test('parse flags as boolean', (assert) => {
    const parser = new Parser({
      admin: {
        type: 'boolean' as 'boolean',
        name: 'admin',
        propertyName: 'admin',
        handler: () => {},
      },
    })

    const output = parser.parse(['--admin=true'])
    assert.deepEqual(output, { _: [], admin: true })
  })

  test('parse string values as true', (assert) => {
    const parser = new Parser({
      admin: {
        type: 'boolean' as 'boolean',
        name: 'admin',
        propertyName: 'admin',
        handler: () => {},
      },
    })

    const output = parser.parse(['--admin=yes'])
    assert.deepEqual(output, { _: [], admin: true })
  })

  test('parse negative flags as boolean', (assert) => {
    const parser = new Parser({
      admin: {
        type: 'boolean' as 'boolean',
        name: 'admin',
        propertyName: 'admin',
        handler: () => {},
      },
    })

    const output = parser.parse(['--no-admin'])
    assert.deepEqual(output, { _: [], admin: false })
  })

  test('set flag to true when its undefined', (assert) => {
    const parser = new Parser({
      admin: {
        type: 'boolean' as 'boolean',
        name: 'admin',
        propertyName: 'admin',
        handler: () => {},
      },
    })

    const output = parser.parse(['--admin'])
    assert.deepEqual(output, { _: [], admin: true })
  })

  test('parse flags as string', (assert) => {
    const parser = new Parser({
      admin: {
        type: 'string' as 'string',
        name: 'admin',
        propertyName: 'admin',
        handler: () => {},
      },
    })

    const output = parser.parse(['--admin=true'])
    assert.deepEqual(output, { _: [], admin: 'true' })
  })

  test('set flag to empty string when its undefined', (assert) => {
    const parser = new Parser({
      admin: {
        type: 'string' as 'string',
        name: 'admin',
        propertyName: 'admin',
        handler: () => {},
      },
    })

    const output = parser.parse(['--admin'])
    assert.deepEqual(output, { _: [], admin: '' })
  })

  test('set flag to number', (assert) => {
    const parser = new Parser({
      age: {
        type: 'number' as 'number',
        name: 'age',
        propertyName: 'age',
        handler: () => {},
      },
    })

    const output = parser.parse(['--age=22'])
    assert.deepEqual(output, { _: [], age: 22 })
  })

  test('set number like values as string when defined as string', (assert) => {
    const parser = new Parser({
      age: {
        type: 'string' as 'string',
        name: 'age',
        propertyName: 'age',
        handler: () => {},
      },
    })

    const output = parser.parse(['--age=22'])
    assert.deepEqual(output, { _: [], age: '22' })
  })

  test('raise error when value is not a number', (assert) => {
    const parser = new Parser({
      age: {
        type: 'number' as 'number',
        name: 'age',
        propertyName: 'age',
        handler: () => {},
      },
    })

    const output = () => parser.parse(['--age=foo'])
    assert.throw(output, 'E_INVALID_TYPE: "age" must be defined as "number"')
  })

  test('parse value as an array of strings', (assert) => {
    const parser = new Parser({
      names: {
        type: 'array' as 'array',
        name: 'names',
        propertyName: 'names',
        handler: () => {},
      },
    })

    const output = parser.parse(['--names=virk'])
    assert.deepEqual(output, { _: [], names: ['virk'] })
  })

  test('parse value as an array of strings when passed for multiple times', (assert) => {
    const parser = new Parser({
      names: {
        type: 'array' as 'array',
        name: 'names',
        propertyName: 'names',
        handler: () => {},
      },
    })

    const output = parser.parse(['--names=virk', '--names=nikk'])
    assert.deepEqual(output, { _: [], names: ['virk', 'nikk'] })
  })

  test('parse value as an array of number', (assert) => {
    const parser = new Parser({
      scores: {
        type: 'numArray' as 'numArray',
        name: 'scores',
        propertyName: 'scores',
        handler: () => {},
      },
    })

    const output = parser.parse(['--scores=10'])
    assert.deepEqual(output, { _: [], scores: [10] })
  })

  test('parse value as an array of number when passed for multiple times', (assert) => {
    const parser = new Parser({
      scores: {
        type: 'numArray' as 'numArray',
        name: 'scores',
        propertyName: 'scores',
        handler: () => {},
      },
    })

    const output = parser.parse(['--scores=10', '--scores=20'])
    assert.deepEqual(output, { _: [], scores: [10, 20] })
  })

  test('raise error when one of the array value is not a number', (assert) => {
    const parser = new Parser({
      scores: {
        type: 'numArray' as 'numArray',
        name: 'scores',
        propertyName: 'scores',
        handler: () => {},
      },
    })

    const output = () => parser.parse(['--scores=10', '--scores=foo'])
    assert.throw(output, 'E_INVALID_TYPE: "scores" must be defined as "numArray"')

    const fn = () => parser.parse(['--scores=foo'])
    assert.throw(fn, 'E_INVALID_TYPE: "scores" must be defined as "numArray"')
  })
})

test.group('Parser | args', () => {
  test('parse string arguments', (assert) => {
    class Greet extends BaseCommand {
      @args.string()
      public name: string

      public async handle () {}
    }

    const parser = new Parser({})

    const output = parser.parse(['virk'], Greet)
    assert.deepEqual(output, { _: ['virk'] })
  })

  test('mark argument as optional', (assert) => {
    class Greet extends BaseCommand {
      @args.string({ required: false })
      public name: string

      public async handle () {}
    }

    const parser = new Parser({})

    const output = parser.parse([], Greet)
    assert.deepEqual(output, { _: [] })
  })
})
