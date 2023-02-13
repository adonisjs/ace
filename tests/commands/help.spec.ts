/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Kernel } from '../../src/kernel.js'
import { HelpCommand } from '../../index.js'
import { args } from '../../src/decorators/args.js'
import { flags } from '../../src/decorators/flags.js'
import { BaseCommand } from '../../src/commands/base.js'
import { ListLoader } from '../../src/loaders/list_loader.js'

test.group('Help command', () => {
  test('show help for a registered command', async ({ assert }) => {
    const kernel = Kernel.create()
    kernel.ui.switchMode('raw')

    class Serve extends BaseCommand {
      static commandName: string = 'serve'
      static description: string = 'Start the AdonisJS HTTP server'
    }

    kernel.addLoader(new ListLoader([Serve]))
    const command = await kernel.create(HelpCommand, ['serve'])
    await command.exec()

    assert.equal(command.exitCode, 0)
    assert.deepEqual(kernel.ui.logger.getLogs(), [
      {
        message: '',
        stream: 'stdout',
      },
      {
        message: 'yellow(Description:)',
        stream: 'stdout',
      },
      {
        message: ['  Start the AdonisJS HTTP server'].join('\n'),
        stream: 'stdout',
      },
      {
        message: '',
        stream: 'stdout',
      },
      {
        message: 'yellow(Usage:)',
        stream: 'stdout',
      },
      {
        message: '  serve ',
        stream: 'stdout',
      },
    ])
  })

  test('show command args in help output', async ({ assert }) => {
    const kernel = Kernel.create()
    kernel.ui.switchMode('raw')

    class MakeController extends BaseCommand {
      @args.string({ description: 'Name of the controller' })
      declare name: string

      static commandName: string = 'make:controller'
      static description: string = 'Make a new HTTP controller'
    }

    kernel.addLoader(new ListLoader([MakeController]))
    const command = await kernel.create(HelpCommand, ['make:controller'])
    await command.exec()

    assert.equal(command.exitCode, 0)
    assert.deepEqual(kernel.ui.logger.getLogs(), [
      {
        message: '',
        stream: 'stdout',
      },
      {
        message: 'yellow(Description:)',
        stream: 'stdout',
      },
      {
        message: ['  Make a new HTTP controller'].join('\n'),
        stream: 'stdout',
      },
      {
        message: '',
        stream: 'stdout',
      },
      {
        message: 'yellow(Usage:)',
        stream: 'stdout',
      },
      {
        message: '  make:controller dim(<name>)',
        stream: 'stdout',
      },
      {
        message: '',
        stream: 'stdout',
      },
      {
        message: 'yellow(Arguments:)',
        stream: 'stdout',
      },
      {
        message: '  green(name)  dim(Name of the controller)',
        stream: 'stdout',
      },
    ])
  })

  test('show command optional arg in help output', async ({ assert }) => {
    const kernel = Kernel.create()
    kernel.ui.switchMode('raw')

    class MakeController extends BaseCommand {
      @args.string({ description: 'Name of the controller', required: false })
      declare name: string

      static commandName: string = 'make:controller'
      static description: string = 'Make a new HTTP controller'
    }

    kernel.addLoader(new ListLoader([MakeController]))
    const command = await kernel.create(HelpCommand, ['make:controller'])
    await command.exec()

    assert.equal(command.exitCode, 0)
    assert.deepEqual(kernel.ui.logger.getLogs(), [
      {
        message: '',
        stream: 'stdout',
      },
      {
        message: 'yellow(Description:)',
        stream: 'stdout',
      },
      {
        message: ['  Make a new HTTP controller'].join('\n'),
        stream: 'stdout',
      },
      {
        message: '',
        stream: 'stdout',
      },
      {
        message: 'yellow(Usage:)',
        stream: 'stdout',
      },
      {
        message: '  make:controller dim([<name>])',
        stream: 'stdout',
      },
      {
        message: '',
        stream: 'stdout',
      },
      {
        message: 'yellow(Arguments:)',
        stream: 'stdout',
      },
      {
        message: '  green([name])  dim(Name of the controller)',
        stream: 'stdout',
      },
    ])
  })

  test('show command flags in the output', async ({ assert }) => {
    const kernel = Kernel.create()
    kernel.ui.switchMode('raw')

    class MakeController extends BaseCommand {
      @flags.boolean({ description: 'Create resource methods' })
      declare resource: boolean

      static commandName: string = 'make:controller'
      static description: string = 'Make a new HTTP controller'
    }

    kernel.addLoader(new ListLoader([MakeController]))
    const command = await kernel.create(HelpCommand, ['make:controller'])
    await command.exec()

    assert.equal(command.exitCode, 0)
    assert.deepEqual(kernel.ui.logger.getLogs(), [
      {
        message: '',
        stream: 'stdout',
      },
      {
        message: 'yellow(Description:)',
        stream: 'stdout',
      },
      {
        message: ['  Make a new HTTP controller'].join('\n'),
        stream: 'stdout',
      },
      {
        message: '',
        stream: 'stdout',
      },
      {
        message: 'yellow(Usage:)',
        stream: 'stdout',
      },
      {
        message: '  make:controller dim([options])',
        stream: 'stdout',
      },
      {
        message: '',
        stream: 'stdout',
      },
      {
        message: 'yellow(Options:)',
        stream: 'stdout',
      },
      {
        message: '  green(--resource)  dim(Create resource methods)',
        stream: 'stdout',
      },
    ])
  })

  test('show required flags in the output', async ({ assert }) => {
    const kernel = Kernel.create()
    kernel.ui.switchMode('raw')

    class MakeController extends BaseCommand {
      @flags.boolean({ description: 'Create resource methods', required: true })
      declare resource: boolean

      static commandName: string = 'make:controller'
      static description: string = 'Make a new HTTP controller'
    }

    kernel.addLoader(new ListLoader([MakeController]))
    const command = await kernel.create(HelpCommand, ['make:controller'])
    await command.exec()

    assert.equal(command.exitCode, 0)
    assert.deepEqual(kernel.ui.logger.getLogs(), [
      {
        message: '',
        stream: 'stdout',
      },
      {
        message: 'yellow(Description:)',
        stream: 'stdout',
      },
      {
        message: ['  Make a new HTTP controller'].join('\n'),
        stream: 'stdout',
      },
      {
        message: '',
        stream: 'stdout',
      },
      {
        message: 'yellow(Usage:)',
        stream: 'stdout',
      },
      {
        message: '  make:controller dim([options])',
        stream: 'stdout',
      },
      {
        message: '',
        stream: 'stdout',
      },
      {
        message: 'yellow(Options:)',
        stream: 'stdout',
      },
      {
        message: '  green(--resource)  dim(Create resource methods)',
        stream: 'stdout',
      },
    ])
  })

  test('show command aliases', async ({ assert }) => {
    const kernel = Kernel.create()
    kernel.ui.switchMode('raw')

    class MakeController extends BaseCommand {
      static aliases: string[] = ['mc', 'controller']
      static commandName: string = 'make:controller'
      static description: string = 'Make a new HTTP controller'
    }

    kernel.addLoader(new ListLoader([MakeController]))
    const command = await kernel.create(HelpCommand, ['make:controller'])
    await command.exec()

    assert.equal(command.exitCode, 0)
    assert.deepEqual(kernel.ui.logger.getLogs(), [
      {
        message: '',
        stream: 'stdout',
      },
      {
        message: 'yellow(Description:)',
        stream: 'stdout',
      },
      {
        message: ['  Make a new HTTP controller'].join('\n'),
        stream: 'stdout',
      },
      {
        message: '',
        stream: 'stdout',
      },
      {
        message: 'yellow(Usage:)',
        stream: 'stdout',
      },
      {
        message: ['  make:controller ', '  mc ', '  controller '].join('\n'),
        stream: 'stdout',
      },
    ])
  })

  test('show command help', async ({ assert }) => {
    const kernel = Kernel.create()
    kernel.ui.switchMode('raw')

    class MakeController extends BaseCommand {
      static aliases: string[] = ['mc', 'controller']
      static commandName: string = 'make:controller'
      static description: string = 'Make a new HTTP controller'
      static help?: string | string[] | undefined = '{{ binaryName }}make:controller'
    }

    kernel.addLoader(new ListLoader([MakeController]))
    kernel.info.set('binary', 'node ace')
    const command = await kernel.create(HelpCommand, ['make:controller'])
    await command.exec()

    assert.equal(command.exitCode, 0)
    assert.deepEqual(kernel.ui.logger.getLogs(), [
      {
        message: '',
        stream: 'stdout',
      },
      {
        message: 'yellow(Description:)',
        stream: 'stdout',
      },
      {
        message: ['  Make a new HTTP controller'].join('\n'),
        stream: 'stdout',
      },
      {
        message: '',
        stream: 'stdout',
      },
      {
        message: 'yellow(Usage:)',
        stream: 'stdout',
      },
      {
        message: ['  node ace make:controller ', '  node ace mc ', '  node ace controller '].join(
          '\n'
        ),
        stream: 'stdout',
      },
      {
        message: '',
        stream: 'stdout',
      },
      {
        message: 'yellow(Help:)',
        stream: 'stdout',
      },
      {
        message: '  node ace make:controller',
        stream: 'stdout',
      },
    ])
  })

  test('do not display description when not defined', async ({ assert }) => {
    const kernel = Kernel.create()
    kernel.ui.switchMode('raw')

    class MakeController extends BaseCommand {
      static aliases: string[] = ['mc', 'controller']
      static commandName: string = 'make:controller'
    }

    kernel.addLoader(new ListLoader([MakeController]))
    kernel.info.set('binary', 'node ace')
    const command = await kernel.create(HelpCommand, ['make:controller'])
    await command.exec()

    assert.equal(command.exitCode, 0)
    assert.deepEqual(kernel.ui.logger.getLogs(), [
      {
        message: '',
        stream: 'stdout',
      },
      {
        message: 'yellow(Usage:)',
        stream: 'stdout',
      },
      {
        message: ['  node ace make:controller ', '  node ace mc ', '  node ace controller '].join(
          '\n'
        ),
        stream: 'stdout',
      },
    ])
  })

  test('error when command not found', async ({ assert }) => {
    const kernel = Kernel.create()
    kernel.ui.switchMode('raw')

    kernel.addLoader(new ListLoader([]))
    const command = await kernel.create(HelpCommand, ['serve'])
    await command.exec()

    assert.equal(command.exitCode, 1)
    assert.deepEqual(kernel.ui.logger.getLogs(), [
      {
        message: 'red(Command "serve" is not defined)',
        stream: 'stderr',
      },
    ])
  })

  test('display suggestions when there are matching commands', async ({ assert }) => {
    const kernel = Kernel.create()
    kernel.ui.switchMode('raw')

    class Serve extends BaseCommand {
      static commandName: string = 'serve'
      static description: string = 'Start the AdonisJS HTTP server'
    }

    kernel.addLoader(new ListLoader([Serve]))
    const command = await kernel.create(HelpCommand, ['srve'])
    await command.exec()

    assert.equal(command.exitCode, 1)
    assert.deepEqual(kernel.ui.logger.getLogs(), [
      {
        message: ['red(Command "srve" is not defined)', '', 'dim(Did you mean?) serve'].join('\n'),
        stream: 'stderr',
      },
    ])
  })
})
