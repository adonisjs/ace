/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import test from 'japa'
import { join } from 'path'
import { template, templateFromFile } from '../src/utils/template'

test.group('template', () => {
  test('template: interpolate valid template', (assert) => {
    const result = template('${test} ${other}', {
      test: 123,
      other: 'hello',
    })
    assert.strictEqual(result, '123 hello')
  })

  test('template: error if a value is missing', (assert) => {
    assert.throws(
      () => template('${param}', {}),
      'Missing value for "param"'
    )
  })

  test('templateFromFile: interpolate valid template', (assert) => {
    const result = templateFromFile(join(__dirname, 'fixtures/template1.txt'), {
      value1: 'World',
      value2: 42,
    })

    assert.strictEqual(result, 'Hello World, 42')
  })

  test('templateFromFile: error if a value is missing', (assert) => {
    assert.throws(() => templateFromFile(join(__dirname, 'fixtures/template1.txt'), {
      value1: 'World',
    }), 'Missing value for "value2"')
  })

  test('templateFromFile: error if file is missing', (assert) => {
    assert.throws(() => templateFromFile(join(__dirname, 'fixtures/i-do-not-exist'), {}))
  })
})
