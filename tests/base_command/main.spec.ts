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
import type { Argument, CommandOptions, Flag } from '../../src/types.js'

test.group('Base command', () => {
  test('access command name from command instance', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'make:model'
      declare name: string
      declare connection: string
    }

    MakeModel.boot()

    const kernel = Kernel.create()
    const model = new MakeModel(
      kernel,
      { _: [], args: [], unknownFlags: [], flags: {}, nodeArgs: [] },
      cliui(),
      kernel.prompt
    )

    assert.equal(model.commandName, 'make:model')
  })

  test('access command options from command instance', ({ assert, expectTypeOf }) => {
    class MakeModel extends BaseCommand {
      static options: CommandOptions = {
        allowUnknownFlags: true,
      }
      declare name: string
      declare connection: string
    }

    MakeModel.boot()

    const kernel = Kernel.create()
    const model = new MakeModel(
      kernel,
      { _: [], args: [], unknownFlags: [], flags: {}, nodeArgs: [] },
      cliui(),
      kernel.prompt
    )

    expectTypeOf(model.options).toEqualTypeOf<CommandOptions>()
    assert.deepEqual(model.options, {
      allowUnknownFlags: true,
    })
  })

  test('access the ui logger from the logger property', ({ assert }) => {
    class MakeModel extends BaseCommand {
      declare name: string
      declare connection: string
    }

    MakeModel.boot()

    const kernel = Kernel.create()
    const model = new MakeModel(
      kernel,
      { _: [], args: [], unknownFlags: [], flags: {}, nodeArgs: [] },
      cliui(),
      kernel.prompt
    )
    assert.strictEqual(model.logger, model.ui.logger)
  })

  test('access the ui colors from the colors property', ({ assert }) => {
    class MakeModel extends BaseCommand {
      declare name: string
      declare connection: string
    }

    MakeModel.boot()

    const kernel = Kernel.create()
    const model = new MakeModel(
      kernel,
      { _: [], args: [], unknownFlags: [], flags: {}, nodeArgs: [] },
      cliui(),
      kernel.prompt
    )
    assert.strictEqual(model.colors, model.ui.colors)
  })
})

test.group('Base command | consume args', () => {
  test('consume parsed output to set command properties', async ({ assert }) => {
    class MakeModel extends BaseCommand {
      declare name: string
      declare connection: string
    }

    MakeModel.defineArgument('name', { type: 'string' })
    MakeModel.defineFlag('connection', { type: 'string' })

    const kernel = Kernel.create()
    const model = await kernel.create(MakeModel, ['user', '--connection=sqlite'])

    assert.equal(model.name, 'user')
    assert.equal(model.connection, 'sqlite')
  })

  test('consume spread arg', async ({ assert }) => {
    class MakeModel extends BaseCommand {
      declare names: string[]
      declare connection: string
    }

    MakeModel.defineArgument('names', { type: 'spread' })
    MakeModel.defineFlag('connection', { type: 'string' })

    const kernel = Kernel.create()
    const model = await kernel.create(MakeModel, ['user', 'post', '--connection=sqlite'])

    assert.deepEqual(model.names, ['user', 'post'])
    assert.equal(model.connection, 'sqlite')
  })

  test('access command args from command instance', ({ assert, expectTypeOf }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'make:model'
      declare name: string
      declare connection: string
    }

    MakeModel.boot()
    MakeModel.defineArgument('name', { type: 'string' })
    MakeModel.defineFlag('connection', { type: 'string' })

    const kernel = Kernel.create()
    const model = new MakeModel(
      kernel,
      { _: [], args: [], unknownFlags: [], flags: {}, nodeArgs: [] },
      cliui(),
      kernel.prompt
    )

    expectTypeOf(model.args).toEqualTypeOf<Argument[]>()
    assert.deepEqual(model.args, [
      {
        name: 'name',
        argumentName: 'name',
        required: true,
        type: 'string',
      },
    ])
  })
})

test.group('Base command | consume flags', () => {
  test('consume boolean flag', async ({ assert }) => {
    class MakeModel extends BaseCommand {
      declare name: string
      declare connection: string
      declare dropAll: boolean
    }

    MakeModel.defineArgument('name', { type: 'string' })
    MakeModel.defineFlag('connection', { type: 'string' })
    MakeModel.defineFlag('dropAll', { type: 'boolean', default: true })

    const kernel = Kernel.create()
    const model = await kernel.create(MakeModel, ['user', '--connection=sqlite', '--drop-all'])

    assert.equal(model.name, 'user')
    assert.equal(model.connection, 'sqlite')
    assert.isTrue(model.dropAll)
  })

  test('consume array flag', async ({ assert }) => {
    class MakeModel extends BaseCommand {
      declare name: string
      declare connections: string[]
      declare dropAll: boolean
    }

    MakeModel.defineArgument('name', { type: 'string' })
    MakeModel.defineFlag('connections', { type: 'array' })
    MakeModel.defineFlag('dropAll', { type: 'boolean' })

    const kernel = Kernel.create()
    const model = await kernel.create(MakeModel, [
      'user',
      '--connections=sqlite',
      '--connections=mysql',
    ])

    assert.equal(model.name, 'user')
    assert.deepEqual(model.connections, ['sqlite', 'mysql'])
    assert.isUndefined(model.dropAll)
  })

  test('use default value when array flag is missing', async ({ assert }) => {
    class MakeModel extends BaseCommand {
      declare name: string
      declare connections: string[]
      declare dropAll: boolean
    }

    MakeModel.defineArgument('name', { type: 'string' })
    MakeModel.defineFlag('connections', { type: 'array', default: ['sqlite'] })
    MakeModel.defineFlag('dropAll', { type: 'boolean' })

    const kernel = Kernel.create()
    const model = await kernel.create(MakeModel, ['user'])

    assert.equal(model.name, 'user')
    assert.deepEqual(model.connections, ['sqlite'])
    assert.isUndefined(model.dropAll)
  })

  test('access command flags from command instance', ({ assert, expectTypeOf }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'make:model'
      declare name: string
      declare connection: string
    }

    MakeModel.boot()
    MakeModel.defineArgument('name', { type: 'string' })
    MakeModel.defineFlag('connection', { type: 'string' })

    const kernel = Kernel.create()
    const model = new MakeModel(
      kernel,
      { _: [], args: [], unknownFlags: [], flags: {}, nodeArgs: [] },
      cliui(),
      kernel.prompt
    )

    expectTypeOf(model.flags).toEqualTypeOf<Flag[]>()
    assert.deepEqual(model.flags, [
      {
        name: 'connection',
        flagName: 'connection',
        required: false,
        type: 'string',
      },
    ])
  })
})
