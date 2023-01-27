/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { cliui } from '@poppinss/cliui'
import {
  validateCommand,
  sortAlphabetically,
  validateCommandMetaData,
  renderErrorWithSuggestions,
} from '../src/helpers.js'

test.group('Helpers | Sort', () => {
  test('sort values alphabetically', ({ assert }) => {
    const values = ['hello', 'make', 'hi', 'run', 'hello']
    assert.deepEqual(values.sort(sortAlphabetically), ['hello', 'hello', 'hi', 'make', 'run'])
  })
})

test.group('Helpers | renderErrorWithSuggestions', () => {
  test('render an error message with suggestions', ({ assert }) => {
    const ui = cliui({ mode: 'raw' })
    renderErrorWithSuggestions(ui, 'Command "foo" is not defined', ['bar'])

    assert.deepEqual(ui.logger.getLogs(), [
      {
        message: 'red(Command "foo" is not defined)\n\ndim(Did you mean?) bar',
        stream: 'stderr',
      },
    ])
  })

  test('render an error message without suggestions', ({ assert }) => {
    const ui = cliui({ mode: 'raw' })
    renderErrorWithSuggestions(ui, 'Command "foo" is not defined', [])

    assert.deepEqual(ui.logger.getLogs(), [
      {
        message: 'red(Command "foo" is not defined)',
        stream: 'stderr',
      },
    ])
  })
})

test.group('Helpers | validateCommandMetaData', () => {
  test('raise error when command metadata is not an object', ({ assert }) => {
    assert.throws(
      () => validateCommandMetaData('foo', '"./foo.js" file'),
      'Invalid command metadata exported from "./foo.js" file'
    )
  })

  test('raise error when command metadata is incomplete', ({ assert }) => {
    assert.throws(
      () => validateCommandMetaData({}, '"./foo.js" file'),
      'Invalid command exported from "./foo.js" file. requires property "aliases"'
    )
  })

  test('work fine when command metadata is complete', ({ assert }) => {
    assert.doesNotThrows(() =>
      validateCommandMetaData(
        {
          commandName: 'serve',
          description: '',
          aliases: [],
          namespace: null,
          args: [],
          flags: [],
          options: {},
        },
        '"./foo.js" file'
      )
    )
  })
})

test.group('Helpers | validateCommand', () => {
  test('raise error when command is not a constructor', ({ assert }) => {
    assert.throws(
      () => validateCommand('foo', '"./foo.js" file'),
      'Invalid command exported from "./foo.js" file. Expected command to be a class'
    )
  })

  test('raise error when command class does not have a serialize method', ({ assert }) => {
    class MakeController {}

    assert.throws(
      () => validateCommand(MakeController, '"./foo.js" file'),
      'Invalid command exported from "./foo.js" file. Expected command to extend the "BaseCommand"'
    )
  })

  test('raise error when command metadata is invalid', ({ assert }) => {
    class MakeController {
      static serialize() {
        return {}
      }
    }

    assert.throws(
      () => validateCommand(MakeController, '"./foo.js" file'),
      'Invalid command exported from "./foo.js" file. requires property "aliases"'
    )
  })

  test('work fine when metadata is valid', ({ assert }) => {
    class MakeController {
      static serialize() {
        return {
          commandName: 'serve',
          description: '',
          aliases: [],
          namespace: null,
          args: [],
          flags: [],
          options: {},
        }
      }
    }

    assert.doesNotThrows(
      () => validateCommand(MakeController, '"./foo.js" file'),
      'Invalid command exported from "./foo.js" file. requires property "aliases"'
    )
  })
})
