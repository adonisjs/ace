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
import { Kernel } from '../../src/kernel.js'
import { CommandOptions } from '../../src/types.js'
import { BaseCommand } from '../../src/commands/base.js'
import { ListLoader } from '../../src/loaders/list_loader.js'
import { args, flags } from '../../index.js'

test.group('Kernel | handle', (group) => {
  group.each.teardown(() => {
    process.exitCode = undefined
  })

  test('execute command as main command', async ({ assert }) => {
    const kernel = Kernel.create()
    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {
        assert.equal(this.kernel.getState(), 'running')
        assert.strictEqual(this.kernel.getMainCommand(), this)
        return 'executed'
      }
    }

    kernel.addLoader(new ListLoader([MakeController]))
    await kernel.handle(['make:controller'])

    assert.equal(kernel.exitCode, 0)
    assert.equal(kernel.getState(), 'completed')
  })

  test('report error using logger command validation fails', async ({ assert }) => {
    const kernel = Kernel.create()
    kernel.ui = cliui({ mode: 'raw' })

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {
        return 'executed'
      }
    }
    MakeController.defineArgument('name', { type: 'string' })

    kernel.addLoader(new ListLoader([MakeController]))
    await kernel.handle(['make:controller'])

    assert.equal(kernel.getState(), 'completed')
    assert.equal(kernel.exitCode, 1)

    assert.deepEqual(kernel.ui.logger.getRenderer().getLogs(), [
      {
        message: 'bgRed(white(  ERROR  )) Missing required argument "name"',
        stream: 'stderr',
      },
    ])
  })

  test('report error using logger when unable to find command', async ({ assert }) => {
    const kernel = Kernel.create()
    kernel.ui = cliui({ mode: 'raw' })

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {
        return 'executed'
      }
    }
    MakeController.defineArgument('name', { type: 'string' })

    kernel.addLoader(new ListLoader([MakeController]))
    await kernel.handle(['foo'])

    assert.equal(kernel.getState(), 'completed')
    assert.equal(kernel.exitCode, 1)
    assert.deepEqual(kernel.ui.logger.getRenderer().getLogs(), [
      {
        message: 'red(Command "foo" is not defined)',
        stream: 'stderr',
      },
    ])
  })

  test('report error when command hooks fails', async ({ assert }) => {
    const kernel = Kernel.create()
    const stack: string[] = []

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {
        stack.push('run')
        return 'executed'
      }
    }
    MakeController.defineArgument('name', { type: 'string' })

    kernel.addLoader(new ListLoader([MakeController]))
    kernel.executing(() => {
      stack.push('executing')
    })
    kernel.executed(() => {
      stack.push('executed')
      throw new Error('Post hook failed')
    })

    await kernel.handle(['make:controller', 'users'])

    assert.equal(kernel.getState(), 'completed')
    assert.equal(kernel.exitCode, 1)
    assert.deepEqual(stack, ['executing', 'run', 'executed'])
  })

  test('disallow calling handle method twice in parallel', async ({ assert }) => {
    const kernel = Kernel.create()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {
        return 'executed'
      }
    }
    MakeController.defineArgument('name', { type: 'string' })
    kernel.addLoader(new ListLoader([MakeController]))
    await kernel.boot()

    await assert.rejects(
      () =>
        Promise.all([
          kernel.handle(['make:controller', 'users']),
          kernel.handle(['make:controller', 'users']),
        ]),
      'Cannot run multiple main commands from a single process'
    )
  })

  test('disallow calling handle method after the process has been completed', async ({
    assert,
  }) => {
    const kernel = Kernel.create()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {
        return 'executed'
      }
    }
    MakeController.defineArgument('name', { type: 'string' })
    kernel.addLoader(new ListLoader([MakeController]))
    await kernel.handle(['make:controller', 'users'])

    await assert.rejects(
      () => kernel.handle(['make:controller', 'users']),
      'The kernel has been terminated. Create a fresh instance to execute commands'
    )
  })

  test('disallow calling exec method after the process has been terminated', async ({ assert }) => {
    const kernel = Kernel.create()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {
        return 'executed'
      }
    }
    MakeController.defineArgument('name', { type: 'string' })
    kernel.addLoader(new ListLoader([MakeController]))
    await kernel.handle(['make:controller', 'users'])

    await assert.rejects(
      () => kernel.exec('make:controller', ['users']),
      'The kernel has been terminated. Create a fresh instance to execute commands'
    )
  })

  test('run default command when args are provided', async ({ assert }) => {
    const stack: string[] = []

    class Help extends BaseCommand {
      static commandName = 'help'
      async run() {
        stack.push('run help')
      }
    }

    const kernel = new Kernel(Help, Kernel.commandExecutor)
    await kernel.handle([])

    assert.deepEqual(stack, ['run help'])
    assert.equal(kernel.exitCode, 0)
    assert.equal(kernel.getState(), 'completed')
  })

  test('run default command when only flags are provided', async ({ assert }) => {
    const stack: string[] = []

    class Help extends BaseCommand {
      static commandName = 'help'
      static options: CommandOptions = {
        allowUnknownFlags: true,
      }

      async run() {
        stack.push('run help')
      }
    }

    const kernel = new Kernel(Help, Kernel.commandExecutor)
    await kernel.handle(['--help'])

    assert.deepEqual(stack, ['run help'])
    assert.equal(kernel.exitCode, 0)
    assert.equal(kernel.getState(), 'completed')
  })

  test('test if a command is a main command', async ({ assert }) => {
    const kernel = Kernel.create()
    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {
        assert.equal(this.kernel.getState(), 'running')
        assert.strictEqual(this.kernel.getMainCommand(), this)
        assert.isTrue(this.isMain)
        return 'executed'
      }
    }

    kernel.addLoader(new ListLoader([MakeController]))
    await kernel.handle(['make:controller'])

    assert.equal(kernel.exitCode, 0)
    assert.equal(kernel.getState(), 'completed')
  })

  test('execute command using alias', async ({ assert }) => {
    const kernel = Kernel.create()
    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {
        assert.equal(this.kernel.getState(), 'running')
        assert.strictEqual(this.kernel.getMainCommand(), this)
        return 'executed'
      }
    }

    kernel.addLoader(new ListLoader([MakeController]))
    kernel.addAlias('mc', 'make:controller')
    await kernel.handle(['mc'])

    assert.equal(kernel.exitCode, 0)
    assert.equal(kernel.getState(), 'completed')
  })

  test('expand alias before executing command', async ({ assert }) => {
    const kernel = Kernel.create()
    class MakeController extends BaseCommand {
      static commandName = 'make:controller'

      @args.string()
      declare name: string

      @flags.boolean()
      declare resource: boolean

      @flags.boolean()
      declare singular: boolean

      async run() {
        assert.equal(this.kernel.getState(), 'running')
        assert.strictEqual(this.kernel.getMainCommand(), this)
        assert.equal(this.name, 'user')
        assert.isTrue(this.resource)
        assert.isTrue(this.singular)
        return 'executed'
      }
    }

    kernel.addLoader(new ListLoader([MakeController]))
    kernel.addAlias('mc', 'make:controller --resource')
    await kernel.handle(['mc', 'user', '--singular'])

    assert.equal(kernel.exitCode, 0)
    assert.equal(kernel.getState(), 'completed')
  })
})
