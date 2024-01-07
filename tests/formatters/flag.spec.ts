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
import { flags } from '../../src/decorators/flags.js'
import { BaseCommand } from '../../src/commands/base.js'
import { FlagFormatter } from '../../src/formatters/flag.js'

test.group('Formatters | flag', () => {
  test('format string flag name', ({ assert }) => {
    class MakeController extends BaseCommand {
      @flags.string()
      declare connection: string
    }

    const formatter = new FlagFormatter(MakeController.flags[0], colors.raw())
    assert.equal(formatter.formatOption(), '  green(--connection[=CONNECTION])  ')
  })

  test('format required string flag name', ({ assert }) => {
    class MakeController extends BaseCommand {
      @flags.string({ required: true })
      declare connection: string
    }

    const formatter = new FlagFormatter(MakeController.flags[0], colors.raw())
    assert.equal(formatter.formatOption(), '  green(--connection=CONNECTION)  ')
  })

  test('format flag with alias', ({ assert }) => {
    class MakeController extends BaseCommand {
      @flags.string({ required: true, alias: 'c' })
      declare connection: string
    }

    const formatter = new FlagFormatter(MakeController.flags[0], colors.raw())
    assert.equal(formatter.formatOption(), '  green(-c, --connection=CONNECTION)  ')
  })

  test('format flag with mutliple aliases', ({ assert }) => {
    class MakeController extends BaseCommand {
      @flags.string({ required: true, alias: ['c', 'o'] })
      declare connection: string
    }

    const formatter = new FlagFormatter(MakeController.flags[0], colors.raw())
    assert.equal(formatter.formatOption(), '  green(-c,-o, --connection=CONNECTION)  ')
  })

  test('show negated flag', ({ assert }) => {
    class MakeController extends BaseCommand {
      @flags.boolean({ required: true, showNegatedVariantInHelp: true })
      declare resource: boolean
    }

    const formatter = new FlagFormatter(MakeController.flags[0], colors.raw())
    assert.equal(formatter.formatOption(), '  green(--resource|--no-resource)  ')
  })

  test('format array flag name', ({ assert }) => {
    class MakeController extends BaseCommand {
      @flags.array()
      declare connections: string[]
    }

    const formatter = new FlagFormatter(MakeController.flags[0], colors.raw())
    assert.equal(formatter.formatOption(), '  green(--connections[=CONNECTIONS...])  ')
  })

  test('format array flag with aliases', ({ assert }) => {
    class MakeController extends BaseCommand {
      @flags.array({ alias: ['c'] })
      declare connections: string[]
    }

    const formatter = new FlagFormatter(MakeController.flags[0], colors.raw())
    assert.equal(formatter.formatOption(), '  green(-c, --connections[=CONNECTIONS...])  ')
  })

  test('format required array flag name', ({ assert }) => {
    class MakeController extends BaseCommand {
      @flags.array({ required: true })
      declare connections: string[]
    }

    const formatter = new FlagFormatter(MakeController.flags[0], colors.raw())
    assert.equal(formatter.formatOption(), '  green(--connections=CONNECTIONS...)  ')
  })

  test('format numeric flag name', ({ assert }) => {
    class MakeController extends BaseCommand {
      @flags.number()
      declare actions: number
    }

    const formatter = new FlagFormatter(MakeController.flags[0], colors.raw())
    assert.equal(formatter.formatOption(), '  green(--actions[=ACTIONS])  ')
  })

  test('format numeric flag with alias', ({ assert }) => {
    class MakeController extends BaseCommand {
      @flags.number({ alias: 'a' })
      declare actions: number
    }

    const formatter = new FlagFormatter(MakeController.flags[0], colors.raw())
    assert.equal(formatter.formatOption(), '  green(-a, --actions[=ACTIONS])  ')
  })

  test('format required numeric flag name', ({ assert }) => {
    class MakeController extends BaseCommand {
      @flags.number({ required: true })
      declare actions: number
    }

    const formatter = new FlagFormatter(MakeController.flags[0], colors.raw())
    assert.equal(formatter.formatOption(), '  green(--actions=ACTIONS)  ')
  })

  test('format boolean flag name', ({ assert }) => {
    class MakeController extends BaseCommand {
      @flags.boolean()
      declare resource: boolean
    }

    const formatter = new FlagFormatter(MakeController.flags[0], colors.raw())
    assert.equal(formatter.formatOption(), '  green(--resource)  ')
  })

  test('format boolean flag with alias', ({ assert }) => {
    class MakeController extends BaseCommand {
      @flags.boolean({ alias: ['r'] })
      declare resource: boolean
    }

    const formatter = new FlagFormatter(MakeController.flags[0], colors.raw())
    assert.equal(formatter.formatOption(), '  green(-r, --resource)  ')
  })

  test('format required boolean flag name', ({ assert }) => {
    class MakeController extends BaseCommand {
      @flags.boolean({ required: true })
      declare resource: boolean
    }

    const formatter = new FlagFormatter(MakeController.flags[0], colors.raw())
    assert.equal(formatter.formatOption(), '  green(--resource)  ')
  })

  test('format description', ({ assert }) => {
    class MakeController extends BaseCommand {
      @flags.boolean({ description: 'Generate resource actions' })
      declare resource: boolean
    }

    const formatter = new FlagFormatter(MakeController.flags[0], colors.raw())
    assert.equal(formatter.formatDescription(), 'dim(Generate resource actions)')
  })

  test('format description with flag default value', ({ assert }) => {
    class MakeController extends BaseCommand {
      @flags.boolean({ description: 'Generate resource actions', default: true })
      declare resource: boolean
    }

    const formatter = new FlagFormatter(MakeController.flags[0], colors.raw())
    assert.equal(formatter.formatDescription(), 'dim(Generate resource actions [default: true])')
  })

  test('format empty description with flag default value', ({ assert }) => {
    class MakeController extends BaseCommand {
      @flags.boolean({ default: true })
      declare resource: boolean
    }

    const formatter = new FlagFormatter(MakeController.flags[0], colors.raw())
    assert.equal(formatter.formatDescription(), 'dim([default: true])')
  })
})
