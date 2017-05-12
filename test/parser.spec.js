'use strict'

/**
 * adonis-ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const test = require('japa')
const Parser = require('../src/Parser')

test.group('Parser', function () {
  test('should parse signature to find command arguments', function (assert) {
    const parsed = Parser.parseSignature('{name} {age}')
    assert.isArray(parsed.args)
    assert.lengthOf(parsed.args, 2)
  })

  test('should parse signature to find command options', function (assert) {
    const parsed = Parser.parseSignature('{name} {--age}')
    assert.isArray(parsed.args)
    assert.lengthOf(parsed.args, 1)
    assert.isArray(parsed.options)
    assert.lengthOf(parsed.options, 1)
  })

  test('should parse signature to fing options with aliases', function (assert) {
    const parsed = Parser.parseSignature('{name} {-a, --age}')
    assert.equal(parsed.options[0].name, '-a, --age')
  })

  test('should tell whether argument is optional or not', function (assert) {
    const parsed = Parser.parseSignature('{name?}')
    assert.isArray(parsed.args)
    assert.lengthOf(parsed.args, 1)
    assert.equal(parsed.args[0].optional, true)
  })

  test('should find argument default value', function (assert) {
    const parsed = Parser.parseSignature('{name?=virk}')
    assert.isArray(parsed.args)
    assert.lengthOf(parsed.args, 1)
    assert.equal(parsed.args[0].defaultValue, 'virk')
  })

  test('should read argument description', function (assert) {
    const parsed = Parser.parseSignature('{name=virk : Enter your username}')
    assert.isArray(parsed.args)
    assert.lengthOf(parsed.args, 1)
    assert.equal(parsed.args[0].description, 'Enter your username')
  })

  test('should parse multiple options', function (assert) {
    const parsed = Parser.parseSignature('{name=virk : Enter your username} {age : Enter your age}')
    assert.isArray(parsed.args)
    assert.lengthOf(parsed.args, 2)
    assert.equal(parsed.args[0].description, 'Enter your username')
    assert.equal(parsed.args[1].description, 'Enter your age')
  })

  test('should make options accept values', function (assert) {
    const parsed = Parser.parseSignature('{--name=@value}')
    assert.isArray(parsed.options)
    assert.lengthOf(parsed.options, 1)
    assert.equal(parsed.options[0].defaultValue, '@value')
    assert.equal(parsed.options[0].name, '--name')
  })

  test('options with alias must accept value', function (assert) {
    const parsed = Parser.parseSignature('{-a, --age=@value}')
    assert.isArray(parsed.options)
    assert.lengthOf(parsed.options, 1)
    assert.equal(parsed.options[0].defaultValue, '@value')
    assert.equal(parsed.options[0].name, '-a, --age')
  })

  test('options with value can be optional', function (assert) {
    const parsed = Parser.parseSignature('{-a, --age?=@value}')
    assert.isTrue(parsed.options[0].optional)
  })

  test('options with value can have description', function (assert) {
    const parsed = Parser.parseSignature('{-a, --age?=@value:Enter your age}')
    assert.isTrue(parsed.options[0].optional)
    assert.equal(parsed.options[0].description, 'Enter your age')
  })

  test('should return option name', function (assert) {
    const parsed = Parser.parseSignature('{name}')
    assert.equal(parsed.args[0].name, 'name')
  })

  test('should return option name when option is optional', function (assert) {
    const parsed = Parser.parseSignature('{name?}')
    assert.equal(parsed.args[0].name, 'name')
  })

  test('should return option name when option has a default value', function (assert) {
    const parsed = Parser.parseSignature('{name?=virk}')
    assert.equal(parsed.args[0].name, 'name')
  })

  test('should return option name when option has a description', function (assert) {
    const parsed = Parser.parseSignature('{name?=virk:This is a name}')
    assert.equal(parsed.args[0].name, 'name')
    assert.equal(parsed.args[0].description, 'This is a name')
    assert.equal(parsed.args[0].defaultValue, 'virk')
    assert.equal(parsed.args[0].optional, true)
  })
})
