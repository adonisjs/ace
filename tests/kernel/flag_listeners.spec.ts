/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Prompt } from '@poppinss/prompts'
import { Kernel } from '../../src/kernel.js'
import { BaseCommand } from '../../src/commands/base.js'
import { ListLoader } from '../../src/loaders/list_loader.js'
import { ParsedOutput, UIPrimitives } from '../../src/types.js'

test.group('Kernel | handle', (group) => {
  group.each.teardown(() => {
    process.exitCode = undefined
  })

  test('execute flag listener on a global flag', async ({ assert }) => {
    const kernel = Kernel.create()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {
        return 'executed'
      }
    }
    MakeController.defineArgument('name', { type: 'string' })

    kernel.addLoader(new ListLoader([MakeController]))
    kernel.defineFlag('verbose', { type: 'boolean' })
    kernel.on('verbose', (Command, _, options) => {
      assert.strictEqual(Command, MakeController)
      assert.isTrue(options.flags.verbose)
    })

    await kernel.handle(['make:controller', 'users', '--verbose'])

    assert.equal(kernel.getState(), 'completed')
    assert.equal(kernel.exitCode, 0)
  })

  test('execute flag listener on a command flag', async ({ assert }) => {
    const kernel = Kernel.create()

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      async run() {
        return 'executed'
      }
    }
    MakeController.defineArgument('name', { type: 'string' })
    MakeController.defineFlag('connection', { type: 'string' })

    kernel.addLoader(new ListLoader([MakeController]))
    kernel.defineFlag('verbose', { type: 'boolean' })
    kernel.on('connection', (Command, _, options) => {
      assert.strictEqual(Command, MakeController)
      assert.equal(options.flags.connection, 'sqlite')
    })

    await kernel.handle(['make:controller', 'users', '--connection', 'sqlite'])

    assert.equal(kernel.getState(), 'completed')
    assert.equal(kernel.exitCode, 0)
  })

  test('terminate from the flag listener', async ({ assert }) => {
    const kernel = Kernel.create()
    const stack: string[] = []

    class MakeController extends BaseCommand {
      static commandName = 'make:controller'
      constructor(
        $kernel: Kernel<typeof BaseCommand>,
        parsed: ParsedOutput,
        ui: UIPrimitives,
        prompt: Prompt
      ) {
        super($kernel, parsed, ui, prompt)
        stack.push('constructor')
      }

      async run() {
        stack.push('run')
        return 'executed'
      }
    }

    MakeController.defineArgument('name', { type: 'string' })
    kernel.addLoader(new ListLoader([MakeController]))

    kernel.defineFlag('help', { type: 'boolean' })
    kernel.on('help', () => {
      return true
    })

    await kernel.handle(['make:controller', 'users', '--help'])
    assert.equal(kernel.getState(), 'completed')
    assert.equal(kernel.exitCode, 0)
    assert.deepEqual(stack, [])
  })

  test('execute flag listener for the default command', async ({ assert }) => {
    class Help extends BaseCommand {
      static commandName = 'help'
      async run() {
        stack.push('run help')
      }
    }

    const kernel = new Kernel(Help, Kernel.commandExecutor)
    const stack: string[] = []

    kernel.defineFlag('help', { type: 'boolean' })
    kernel.on('help', (Command, _, options) => {
      assert.strictEqual(Command, Help)
      assert.isTrue(options.flags.help)
    })

    await kernel.handle(['--help'])

    assert.equal(kernel.getState(), 'completed')
    assert.equal(kernel.exitCode, 0)
    assert.deepEqual(stack, ['run help'])
  })

  test('terminate from the flag listener for the default command', async ({ assert }) => {
    const stack: string[] = []

    class Help extends BaseCommand {
      static commandName = 'help'
      async run() {
        stack.push('run help')
      }
    }

    const kernel = new Kernel(Help, Kernel.commandExecutor)
    kernel.defineFlag('help', { type: 'boolean' })

    kernel.on('help', (Command, _, options) => {
      assert.strictEqual(Command, Help)
      assert.isTrue(options.flags.help)
      return true
    })

    await kernel.handle(['--help'])

    assert.equal(kernel.getState(), 'completed')
    assert.equal(kernel.exitCode, 0)
    assert.deepEqual(stack, [])
  })
})
