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
import { flags } from '../../src/decorators/flags.js'
import { BaseCommand } from '../../src/commands/base.js'
import { CommandFormatter } from '../../src/formatters/command.js'

test.group('Formatters | command', () => {
  test('format command description', ({ assert }) => {
    class MakeController extends BaseCommand {
      static commandName: string = 'make:controller'
      static description: string = 'Make an HTTP controller'
    }

    const formatter = new CommandFormatter(MakeController.serialize(), colors.raw())
    assert.equal(formatter.formatDescription(), 'Make an HTTP controller')
    assert.equal(formatter.formatListDescription(), 'dim(Make an HTTP controller)')
  })

  test('return empty string when command has no description', ({ assert }) => {
    class MakeController extends BaseCommand {
      static commandName: string = 'make:controller'
    }

    const formatter = new CommandFormatter(MakeController.serialize(), colors.raw())
    assert.equal(formatter.formatDescription(), '')
    assert.equal(formatter.formatListDescription(), '')
  })

  test('format command name for listing', ({ assert }) => {
    class MakeController extends BaseCommand {
      static commandName: string = 'make:controller'
      static description: string = 'Make an HTTP controller'
    }

    const formatter = new CommandFormatter(MakeController.serialize(), colors.raw())
    assert.equal(formatter.formatListName([]), '  green(make:controller)  ')
  })

  test('format command name with aliases for listing', ({ assert }) => {
    class MakeController extends BaseCommand {
      static commandName: string = 'make:controller'
      static description: string = 'Make an HTTP controller'
    }

    const formatter = new CommandFormatter(MakeController.serialize(), colors.raw())
    assert.equal(formatter.formatListName(['mc']), '  green(make:controller) dim((mc))  ')
  })

  test('format command usage', ({ assert }) => {
    class MakeController extends BaseCommand {
      static commandName: string = 'make:controller'
      static description: string = 'Make an HTTP controller'
    }

    const formatter = new CommandFormatter(MakeController.serialize(), colors.raw())
    assert.deepEqual(formatter.formatUsage([]), ['  make:controller '])
  })

  test('format command usage that accepts args', ({ assert }) => {
    class MakeController extends BaseCommand {
      static commandName: string = 'make:controller'
      static description: string = 'Make an HTTP controller'

      @args.string()
      declare name: string
    }

    const formatter = new CommandFormatter(MakeController.serialize(), colors.raw())
    assert.deepEqual(formatter.formatUsage([]), ['  make:controller dim(<name>)'])
  })

  test('format command usage that accepts flags', ({ assert }) => {
    class MakeController extends BaseCommand {
      static commandName: string = 'make:controller'
      static description: string = 'Make an HTTP controller'

      @args.string()
      declare name: string

      @flags.boolean()
      declare resource: boolean
    }

    const formatter = new CommandFormatter(MakeController.serialize(), colors.raw())
    assert.deepEqual(formatter.formatUsage([]), [
      '  make:controller dim([options]) dim([--]) dim(<name>)',
    ])
  })

  test('format command usage that accepts just flags', ({ assert }) => {
    class MakeController extends BaseCommand {
      static commandName: string = 'make:controller'
      static description: string = 'Make an HTTP controller'

      @flags.boolean()
      declare resource: boolean
    }

    const formatter = new CommandFormatter(MakeController.serialize(), colors.raw())
    assert.deepEqual(formatter.formatUsage([]), ['  make:controller dim([options])'])
  })

  test('format command usage with aliases', ({ assert }) => {
    class MakeController extends BaseCommand {
      static commandName: string = 'make:controller'
      static description: string = 'Make an HTTP controller'

      @args.string()
      declare name: string

      @flags.boolean()
      declare resource: boolean
    }

    const formatter = new CommandFormatter(MakeController.serialize(), colors.raw())
    assert.deepEqual(formatter.formatUsage(['mc']), [
      '  make:controller dim([options]) dim([--]) dim(<name>)',
      '  mc dim([options]) dim([--]) dim(<name>)',
    ])
  })

  test('format command usage with binary name', ({ assert }) => {
    class MakeController extends BaseCommand {
      static commandName: string = 'make:controller'
      static description: string = 'Make an HTTP controller'

      @args.string()
      declare name: string

      @flags.boolean()
      declare resource: boolean
    }

    const formatter = new CommandFormatter(MakeController.serialize(), colors.raw())
    assert.deepEqual(formatter.formatUsage(['mc'], 'node ace'), [
      '  node ace make:controller dim([options]) dim([--]) dim(<name>)',
      '  node ace mc dim([options]) dim([--]) dim(<name>)',
    ])
  })

  test('return empty string when command has no help text', ({ assert }) => {
    class MakeController extends BaseCommand {
      static commandName: string = 'make:controller'

      @args.string()
      declare name: string

      @flags.boolean()
      declare resource: boolean
    }

    const formatter = new CommandFormatter(MakeController.serialize(), colors.raw())
    assert.deepEqual(formatter.formatHelp(undefined, 80), '')
  })

  test('format command help text', ({ assert }) => {
    class MakeController extends BaseCommand {
      static commandName: string = 'make:controller'
      static help = 'Make a new HTTP controller make:controller <name>'

      @args.string()
      declare name: string

      @flags.boolean()
      declare resource: boolean
    }

    const formatter = new CommandFormatter(MakeController.serialize(), colors.raw())
    assert.deepEqual(
      formatter.formatHelp(undefined, 80),
      '  Make a new HTTP controller make:controller <name>'
    )
  })

  test('subsitute binary name in help text', ({ assert }) => {
    class MakeController extends BaseCommand {
      static commandName: string = 'make:controller'
      static help = 'Make a new HTTP controller {{binaryName}}make:controller <name>'

      @args.string()
      declare name: string

      @flags.boolean()
      declare resource: boolean
    }

    const formatter = new CommandFormatter(MakeController.serialize(), colors.raw())
    assert.deepEqual(
      formatter.formatHelp('node ace', 80),
      '  Make a new HTTP controller node ace make:controller <name>'
    )
  })

  test('wrap command help text', ({ assert }) => {
    class MakeController extends BaseCommand {
      static commandName: string = 'make:controller'
      static help = [
        'Make a new HTTP controller',
        'make:controller <name>',
        '',
        'To create a resourceful controller. Run the command with resource flag',
        'make:controller <name> --resource',
      ]

      @args.string()
      declare name: string

      @flags.boolean()
      declare resource: boolean
    }

    const formatter = new CommandFormatter(MakeController.serialize(), colors.raw())
    assert.deepEqual(
      formatter.formatHelp(undefined, 30),
      [
        '  Make a new HTTP controller',
        '  make:controller <name>',
        '  ',
        '  To create a resourceful',
        '  controller. Run the command',
        '  with resource flag',
        '  make:controller <name>',
        '  --resource',
      ].join('\n')
    )
  })
})
