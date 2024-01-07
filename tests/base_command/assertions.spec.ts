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

test.group('Base command | assertions', () => {
  test('assert command has exitCode', async ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'make:model'

      async run() {
        return super.run()
      }
    }

    const kernel = Kernel.create()
    const model = await kernel.create(MakeModel, [])

    await model.exec()
    assert.doesNotThrows(() => model.assertExitCode(0))
    assert.throws(
      () => model.assertExitCode(1),
      `Expected 'make:model' command to finish with exit code '1'`
    )
  })

  test('assert command does not have exitCode', async ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'make:model'

      async run() {
        return super.run()
      }
    }

    const kernel = Kernel.create()
    const model = await kernel.create(MakeModel, [])

    await model.exec()
    assert.doesNotThrows(() => model.assertNotExitCode(1))
    assert.throws(
      () => model.assertNotExitCode(0),
      `Expected 'make:model' command to finish without exit code '0'`
    )
  })

  test('assert command finishes successfully', async ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'make:model'
      async run() {
        return super.run()
      }
    }

    class MakeController extends BaseCommand {
      static commandName: string = 'make:controller'
      async run() {
        this.exitCode = 1
      }
    }

    const kernel = Kernel.create()
    const model = await kernel.create(MakeModel, [])
    await model.exec()
    assert.doesNotThrows(() => model.assertSucceeded())

    const controller = await kernel.create(MakeController, [])
    await controller.exec()
    assert.throws(
      () => controller.assertSucceeded(),
      `Expected 'make:controller' command to finish with exit code '0'`
    )
  })

  test('assert command fails', async ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'make:model'
      async run() {
        return super.run()
      }
    }

    class MakeController extends BaseCommand {
      static commandName: string = 'make:controller'
      async run() {
        this.exitCode = 1
      }
    }

    const kernel = Kernel.create()
    const model = await kernel.create(MakeModel, [])
    await model.exec()
    assert.throws(
      () => model.assertFailed(),
      `Expected 'make:model' command to finish without exit code '0`
    )

    const controller = await kernel.create(MakeController, [])
    await controller.exec()
    assert.doesNotThrows(() => controller.assertFailed())
  })

  test('assert command logs a specific message', async ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'make:model'
      async run() {
        this.logger.info('Running make:model command')
        return super.run()
      }
    }

    const kernel = Kernel.create()
    kernel.ui.switchMode('raw')

    const model = await kernel.create(MakeModel, [])
    await model.exec()

    assert.doesNotThrows(() => model.assertLog('[ blue(info) ] Running make:model command'))
    assert.throws(
      () => model.assertLog('[ cyan(info) ] Running make:model command'),
      `Expected log messages to include '[ cyan(info) ] Running make:model command'`
    )

    assert.doesNotThrows(() =>
      model.assertLog('[ blue(info) ] Running make:model command', 'stdout')
    )
    assert.throws(
      () => model.assertLog('[ blue(info) ] Running make:model command', 'stderr'),
      `Expected log message stream to be 'stderr', instead received 'stdout'`
    )
  })

  test('assert command logs matches a given regex', async ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'make:model'
      async run() {
        this.logger.info('Running make:model command')
        return super.run()
      }
    }

    const kernel = Kernel.create()
    kernel.ui.switchMode('raw')

    const model = await kernel.create(MakeModel, [])
    await model.exec()

    assert.doesNotThrows(() => model.assertLogMatches(/Running make:model command/))
    assert.throws(
      () => model.assertLogMatches(/Running command/),
      `Expected log messages to match /Running command/`
    )

    assert.doesNotThrows(() => model.assertLogMatches(/Running make:model command/, 'stdout'))
    assert.throws(
      () => model.assertLogMatches(/Running make:model command/, 'stderr'),
      `Expected log message stream to be 'stderr', instead received 'stdout'`
    )
  })

  test('assert command logs a table', async ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'make:model'
      async run() {
        const table = this.ui.table()
        table.head(['Name', 'Email'])

        table.row(['Harminder Virk', 'virk@adonisjs.com'])
        table.row(['Romain Lanz', 'romain@adonisjs.com'])
        table.row(['Julien-R44', 'julien@adonisjs.com'])
        table.row(['Michaël Zasso', 'targos@adonisjs.com'])

        table.render()

        return super.run()
      }
    }

    const kernel = Kernel.create()
    kernel.ui.switchMode('raw')

    const model = await kernel.create(MakeModel, [])
    await model.exec()

    assert.doesNotThrows(() =>
      model.assertTableRows([
        ['Harminder Virk', 'virk@adonisjs.com'],
        ['Romain Lanz', 'romain@adonisjs.com'],
        ['Julien-R44', 'julien@adonisjs.com'],
      ])
    )
    assert.doesNotThrows(() =>
      model.assertTableRows([
        ['Harminder Virk', 'virk@adonisjs.com'],
        ['Romain Lanz', 'romain@adonisjs.com'],
        ['Julien-R44', 'julien@adonisjs.com'],
        ['Michaël Zasso', 'targos@adonisjs.com'],
      ])
    )

    assert.throws(
      () =>
        model.assertTableRows([
          ['Harminder Virk', 'virk@adonisjs.com'],
          ['Romain', 'romain@adonisjs.com'],
        ]),
      `Expected log messages to include a table with the expected rows`
    )
  })
})
