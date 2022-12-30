/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { colors } from '@poppinss/cliui'
import { args } from '../../src/decorators/args.js'
import { BaseCommand } from '../../src/commands/base.js'
import { ArgumentFormatter } from '../../src/formatters/argument.js'

test.group('Formatters | arg', () => {
  test('format string arg', ({ assert }) => {
    class MakeController extends BaseCommand {
      @args.string()
      name!: string
    }

    const formatter = new ArgumentFormatter(MakeController.args[0], colors.raw())
    assert.equal(formatter.formatOption(), 'dim(<name>)')
    assert.equal(formatter.formatListOption(), '  green(name)  ')
  })

  test('format optional string arg', ({ assert }) => {
    class MakeController extends BaseCommand {
      @args.string({ required: false })
      name!: string
    }

    const formatter = new ArgumentFormatter(MakeController.args[0], colors.raw())
    assert.equal(formatter.formatOption(), 'dim([<name>])')
    assert.equal(formatter.formatListOption(), '  green([name])  ')
  })

  test('format spread arg', ({ assert }) => {
    class MakeController extends BaseCommand {
      @args.spread()
      name!: string[]
    }

    const formatter = new ArgumentFormatter(MakeController.args[0], colors.raw())
    assert.equal(formatter.formatOption(), 'dim(<name...>)')
    assert.equal(formatter.formatListOption(), '  green(name...)  ')
  })

  test('format optional spread arg', ({ assert }) => {
    class MakeController extends BaseCommand {
      @args.spread({ required: false })
      name!: string[]
    }

    const formatter = new ArgumentFormatter(MakeController.args[0], colors.raw())
    assert.equal(formatter.formatOption(), 'dim([<name...>])')
    assert.equal(formatter.formatListOption(), '  green([name...])  ')
  })

  test('format arg description', ({ assert }) => {
    class MakeController extends BaseCommand {
      @args.string({ description: 'The name of the controller' })
      name!: string
    }

    const formatter = new ArgumentFormatter(MakeController.args[0], colors.raw())
    assert.equal(formatter.formatDescription(), 'dim(The name of the controller)')
  })

  test('format description with flag default value', ({ assert }) => {
    class MakeController extends BaseCommand {
      @args.string({ description: 'The name of the controller', default: 'posts' })
      name!: string
    }

    const formatter = new ArgumentFormatter(MakeController.args[0], colors.raw())
    assert.equal(formatter.formatDescription(), 'dim(The name of the controller [default: posts])')
  })

  test('format empty description with flag default value', ({ assert }) => {
    class MakeController extends BaseCommand {
      @args.string({ default: 'posts' })
      name!: string
    }

    const formatter = new ArgumentFormatter(MakeController.args[0], colors.raw())
    assert.equal(formatter.formatDescription(), 'dim([default: posts])')
  })
})
