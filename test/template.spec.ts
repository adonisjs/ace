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
  test('interpolate valid template', (assert) => {
    const result = template('${test} ${other}', {
      test: 123,
      other: 'hello',
    }, false)
    assert.strictEqual(result, '123 hello')
  })

  test('interpolate template using mustache', (assert) => {
    const result = template('{{test}} {{other}}', {
      test: 123,
      other: 'hello',
    }, true)
    assert.strictEqual(result, '123 hello')
  })
})

test.group('Template From File', () => {
  test('interpolate valid template', (assert) => {
    const result = templateFromFile(join(__dirname, 'fixtures/template1.txt'), {
      value1: 'World',
      value2: 42,
    }, false)

    assert.strictEqual(result, 'Hello World, 42')
  })

  test('error if file is missing', (assert) => {
    assert.throws(() => templateFromFile(join(__dirname, 'fixtures/i-do-not-exist'), {}, false))
  })

  test('interpolate mustache from template file', (assert) => {
    const result = templateFromFile(join(__dirname, 'fixtures/template1.mustache'), {
      value1: 'World',
      value2: 42,
    }, true)
    assert.strictEqual(result.trim(), 'Hello World, 42')
  })
})
