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
import { BaseCommand } from '../../src/commands/base.js'

test.group('Base command | execute', () => {
  test('execute command', async ({ assert }) => {
    class MakeModel extends BaseCommand {
      name!: string
      connection!: string
      stack: string[] = []

      async run() {
        this.stack.push('run')
        return super.run()
      }
    }

    MakeModel.defineArgument('name', { type: 'string' })
    MakeModel.defineFlag('connection', { type: 'string' })

    const kernel = Kernel.create()
    const model = await kernel.create(MakeModel, ['user', '--connection=sqlite'])

    await model.exec()
    assert.deepEqual(model.stack, ['run'])
  })

  test('store run method return value in the result property', async ({ assert }) => {
    class MakeModel extends BaseCommand {
      name!: string
      connection!: string

      async run() {
        return 'completed'
      }
    }

    MakeModel.defineArgument('name', { type: 'string' })
    MakeModel.defineFlag('connection', { type: 'string' })

    const kernel = Kernel.create()
    kernel.ui = cliui({ mode: 'raw' })
    const model = await kernel.create(MakeModel, ['user', '--connection=sqlite'])

    await model.exec()
    assert.equal(model.result, 'completed')
  })

  test('display prompts', async ({ assert }) => {
    class MakeModel extends BaseCommand {
      name!: string
      connection!: string

      async run() {
        if (!this.name) {
          this.name = await this.prompt.ask('Enter model name')
        }

        if (!this.connection) {
          this.connection = await this.prompt.choice('Select command connection', [
            'sqlite',
            'mysql',
          ])
        }
      }
    }

    MakeModel.defineArgument('name', { type: 'string', required: false })
    MakeModel.defineFlag('connection', { type: 'string' })

    const kernel = Kernel.create()
    kernel.ui = cliui({ mode: 'raw' })

    const model = await kernel.create(MakeModel, [])

    model.prompt.trap('Enter model name').replyWith('user')
    model.prompt.trap('Select command connection').chooseOption(0)

    await model.exec()

    assert.equal(model.name, 'user')
    assert.equal(model.connection, 'sqlite')
  })
})

test.group('Base command | execute | run fails', () => {
  test('fail command when run method fails', async ({ assert }) => {
    class MakeModel extends BaseCommand {
      name!: string
      connection!: string
      stack: string[] = []

      async run() {
        throw new Error('Something went wrong')
      }
    }

    MakeModel.defineArgument('name', { type: 'string' })
    MakeModel.defineFlag('connection', { type: 'string' })

    const kernel = Kernel.create()
    kernel.ui = cliui({ mode: 'raw' })
    const model = await kernel.create(MakeModel, ['user', '--connection=sqlite'])

    await model.exec()
    assert.isUndefined(model.result)
    assert.equal(model.error?.message, 'Something went wrong')
    assert.lengthOf(model.ui.logger.getRenderer().getLogs(), 1)
    assert.equal(model.exitCode, 1)
  })
})
