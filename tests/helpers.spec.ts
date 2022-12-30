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
import { renderErrorWithSuggestions, sortAlphabetically } from '../src/helpers.js'

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
