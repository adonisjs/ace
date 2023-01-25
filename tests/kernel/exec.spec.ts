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
import { BaseCommand } from '../../src/commands/base.js'
import { ListLoader } from '../../src/loaders/list_loader.js'

test.group('Kernel | exec', () => {
  test('execute command', async ({ assert }) => {
    const kernel = Kernel.create()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {
        return 'executed'
      }
    }

    kernel.addLoader(new ListLoader([MakeController]))
    const command = await kernel.exec('make:controller', [])

    assert.equal(command.result, 'executed')
    assert.equal(command.result, 'executed')
    assert.equal(command.exitCode, 0)

    assert.isUndefined(kernel.exitCode)
    assert.equal(kernel.getState(), 'booted')
  })

  test('run executing and executed hooks', async ({ assert, expectTypeOf }) => {
    const kernel = Kernel.create()
    const stack: string[] = []

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {
        return 'executed'
      }
    }

    kernel.addLoader(new ListLoader([MakeController]))
    kernel.executing((cmd) => {
      expectTypeOf(cmd).toEqualTypeOf<MakeController>()
      stack.push('executing')
    })
    kernel.executed((cmd) => {
      expectTypeOf(cmd).toEqualTypeOf<MakeController>()
      stack.push('executed')
    })

    const command = await kernel.exec('make:controller', [])
    assert.equal(command.result, 'executed')
    assert.equal(command.exitCode, 0)

    assert.isUndefined(kernel.exitCode)
    assert.equal(kernel.getState(), 'booted')
    assert.deepEqual(stack, ['executing', 'executed'])
  })

  test('report error when command validation fails', async ({ assert }) => {
    const kernel = Kernel.create()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {
        return 'executed'
      }
    }
    MakeController.defineArgument('name', { type: 'string' })

    kernel.addLoader(new ListLoader([MakeController]))
    await assert.rejects(
      () => kernel.exec('make:controller', []),
      'Missing required argument "name"'
    )
  })

  test('report error when unable to find command', async ({ assert }) => {
    const kernel = Kernel.create()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {
        return 'executed'
      }
    }
    MakeController.defineArgument('name', { type: 'string' })

    kernel.addLoader(new ListLoader([MakeController]))
    await assert.rejects(() => kernel.exec('foo', []), 'Command "foo" is not defined')
    assert.isUndefined(kernel.exitCode)
    assert.equal(kernel.getState(), 'booted')
  })

  test('report error when executing hook fails', async ({ assert }) => {
    const kernel = Kernel.create()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {
        return 'executed'
      }
    }
    MakeController.defineArgument('name', { type: 'string' })

    kernel.addLoader(new ListLoader([MakeController]))
    kernel.executing(() => {
      throw new Error('Pre hook failed')
    })

    await assert.rejects(() => kernel.exec('make:controller', ['users']), 'Pre hook failed')
  })

  test('report error when executed hook fails', async ({ assert }) => {
    const kernel = Kernel.create()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {
        return 'executed'
      }
    }
    MakeController.defineArgument('name', { type: 'string' })

    kernel.addLoader(new ListLoader([MakeController]))
    kernel.executed(() => {
      throw new Error('Post hook failed')
    })

    await assert.rejects(() => kernel.exec('make:controller', ['users']), 'Post hook failed')
  })

  test('do not allow termination from non-main commands', async ({ assert }) => {
    const kernel = Kernel.create()
    const stack: string[] = []

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {
        await this.terminate()
        return 'executed'
      }
    }

    MakeController.defineArgument('name', { type: 'string' })

    kernel.addLoader(new ListLoader([MakeController]))
    kernel.terminating(() => {
      stack.push('terminating')
      throw new Error('Never expected to run')
    })

    await kernel.exec('make:controller', ['users'])
    assert.deepEqual(stack, [])
    assert.isUndefined(kernel.exitCode)
    assert.equal(kernel.getState(), 'booted')
  })

  test('use custom executor', async ({ assert }) => {
    const stack: string[] = []

    class MakeModel extends BaseCommand {
      static commandName: string = 'make:model'

      name!: string
      connection!: string

      async prepare() {
        stack.push('prepare')
      }

      async interact() {
        stack.push('interact')
      }

      async completed() {
        stack.push('completed')
      }

      async run() {
        stack.push('run')
      }
    }

    MakeModel.defineArgument('name', { type: 'string' })
    MakeModel.defineFlag('connection', { type: 'string' })

    const kernel = new Kernel(Kernel.defaultCommand, {
      create(Command, parsed, self) {
        stack.push('creating')
        return new Command(self, parsed, self.ui, self.prompt)
      },
      run(command) {
        stack.push('running')
        return command.exec()
      },
    })

    kernel.addLoader(new ListLoader([MakeModel]))

    await kernel.exec('make:model', ['users'])
    assert.deepEqual(stack, ['creating', 'running', 'prepare', 'interact', 'run', 'completed'])
    assert.isUndefined(kernel.exitCode)
    assert.equal(kernel.getState(), 'booted')
  })

  test('do not trigger flag listeners when not executing a main command', async ({ assert }) => {
    const kernel = Kernel.create()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {
        return 'executed'
      }
    }

    MakeController.defineFlag('connections', { type: 'string' })

    kernel.addLoader(new ListLoader([MakeController]))
    kernel.on('connections', () => {
      throw new Error('Never expected to reach here')
    })

    const command = await kernel.exec('make:controller', ['--connections=sqlite'])

    assert.equal(command.result, 'executed')
    assert.equal(command.result, 'executed')
    assert.equal(command.exitCode, 0)

    assert.isUndefined(kernel.exitCode)
    assert.equal(kernel.getState(), 'booted')
  })

  test('disallow using global flags when executing commands', async ({ assert }) => {
    const kernel = Kernel.create()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {
        return 'executed'
      }
    }

    kernel.addLoader(new ListLoader([MakeController]))

    kernel.defineFlag('help', { type: 'boolean' })
    await assert.rejects(
      () => kernel.exec('make:controller', ['--help']),
      'Unknown flag "--help". The mentioned flag is not accepted by the command'
    )
  })
})
