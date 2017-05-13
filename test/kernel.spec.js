'use strict'

/*
 * adonis-ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const test = require('japa')
const kernel = require('../src/Kernel')
const Command = require('../src/Command')
const commander = require('../lib/commander')

test.group('Kernel', (group) => {
  group.beforeEach(() => {
    commander.commands = []
    kernel.commands = {}
  })

  test('add command to the kernel', (assert) => {
    class Generator extends Command {
      static get signature () {
        return 'make:controller'
      }
    }
    kernel.addCommand(Generator)
    assert.deepEqual(kernel.commands, {'make:controller': Generator})
  })

  test('get registered command', (assert) => {
    class Generator extends Command {
      static get signature () {
        return 'make:controller'
      }
    }
    kernel.addCommand(Generator)
    assert.deepEqual(kernel.getCommand('make:controller'), Generator)
  })

  test('exec registered command and return output', async (assert) => {
    class Generator extends Command {
      static get signature () {
        return 'make:controller'
      }

      handle () {
        return 'bar'
      }
    }
    kernel.addCommand(Generator)
    assert.equal(await (kernel.execCommand('make:controller')), 'bar')
  })

  test('exec async command and return output', async (assert) => {
    class Generator extends Command {
      static get signature () {
        return 'make:controller'
      }

      handle () {
        return new Promise((resolve) => {
          setTimeout(() => { resolve('bar') }, 100)
        })
      }
    }
    kernel.addCommand(Generator)
    assert.equal(await (kernel.execCommand('make:controller')), 'bar')
  })

  test('wireup commands with commander when instructed', async (assert) => {
    class Generator extends Command {
      static get signature () {
        return 'make:controller'
      }

      handle () {
        return new Promise((resolve) => {
          setTimeout(() => { resolve('bar') }, 100)
        })
      }
    }

    assert.lengthOf(commander.commands, 0)
    kernel.addCommand(Generator)
    kernel.wireUpWithCommander()
    assert.lengthOf(commander.commands, 1)
  })

  test('output help for global options', async (assert) => {
    const tokens = kernel.outputHelp(commander.options, false).split('\n')
    assert.equal(tokens[0].trim(), 'Usage:')
    assert.equal(tokens[1].trim(), 'command [arguments] [options]')
    assert.equal(tokens[4].trim(), '--env       Set NODE_ENV before running the commands')
    assert.equal(tokens[5].trim(), '--no-ansi   Disable colored output')
  })

  test('output help for commands', async (assert) => {
    class Generator extends Command {
      static get signature () {
        return 'make:controller'
      }

      handle () {
        return new Promise((resolve) => {
          setTimeout(() => { resolve('bar') }, 100)
        })
      }
    }

    kernel.addCommand(Generator)
    const tokens = kernel.outputHelp(commander.options, false).split('\n')
    assert.equal(tokens[0].trim(), 'Usage:')
    assert.equal(tokens[1].trim(), 'command [arguments] [options]')
    assert.equal(tokens[4].trim(), '--env             Set NODE_ENV before running the commands')
    assert.equal(tokens[5].trim(), '--no-ansi         Disable colored output')
    assert.equal(tokens[8].trim(), 'make')
    assert.equal(tokens[9].trim(), 'make:controller')
  })

  test('group all root level commands to top', async (assert) => {
    class Generator extends Command {
      static get signature () {
        return 'make:controller'
      }

      handle () {
        return new Promise((resolve) => {
          setTimeout(() => { resolve('bar') }, 100)
        })
      }
    }

    class Down extends Command {
      static get signature () {
        return 'down'
      }
    }

    kernel.addCommand(Generator)
    kernel.addCommand(Down)

    const tokens = kernel.outputHelp(commander.options, false).split('\n')
    assert.equal(tokens[0].trim(), 'Usage:')
    assert.equal(tokens[1].trim(), 'command [arguments] [options]')
    assert.equal(tokens[8].trim(), 'down')
    assert.equal(tokens[9].trim(), 'make')
    assert.equal(tokens[10].trim(), 'make:controller')
  })

  test('set process.env.NO_ANSI to false by default', async (assert) => {
    kernel.invoke()
    assert.equal(process.env.NO_ANSI, 'false')
  })
})
