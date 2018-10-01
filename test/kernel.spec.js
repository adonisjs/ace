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
const clearModule = require('clear-module')
const path = require('path')

let Command = require('../src/Command')
let kernel = require('../src/Kernel')
let commander = require('../lib/commander')

test.group('Kernel', (group) => {
  group.beforeEach(() => {
    clearModule(path.join(__dirname, '../lib/commander'))
    clearModule(path.join(__dirname, '../src/Kernel'))
    clearModule(path.join(__dirname, '../src/Command'))

    commander = require('../lib/commander')
    kernel = require('../src/Kernel')
    Command = require('../src/Command')
  })

  test('add command to the kernel', (assert) => {
    class Generator extends Command {
      static get signature () {
        return 'make:controller'
      }
    }
    kernel.addCommand(Generator)
    assert.deepEqual(kernel.commands, { 'make:controller': Generator })
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
    assert.equal(await (kernel.call('make:controller')), 'bar')
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
    assert.equal(await (kernel.call('make:controller')), 'bar')
  })

  test('wireup commands with commander when instructed', async (assert) => {
    class Generator extends Command {
      static get signature () {
        return 'make:controller'
      }

      handle () {
      }
    }

    assert.lengthOf(commander.commands, 1)
    kernel.addCommand(Generator)
    kernel.wireUpWithCommander()
    assert.lengthOf(commander.commands, 2)
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

  test('set version option when package has version', async (assert) => {
    class Foo extends Command {
      static get signature () {
        return 'foo'
      }

      handle () {
      }
    }

    kernel.addCommand(Foo)
    Foo.boot()
    Foo.wireUpWithCommander()

    process.argv = ['node', 'test', 'foo']
    kernel.invoke({ version: '1.0.0' })
    assert.equal(commander._version, '1.0.0')
  })

  test('add inline command', async (assert) => {
    kernel.command('down', function () {
      return 'down called'
    })
    const response = await kernel.call('down')
    assert.equal(response, 'down called')
  })

  test('add multiple inline commands', async (assert) => {
    const stack = []
    kernel.command('down', function () {
      stack.push('down')
    })

    kernel.command('up', function () {
      stack.push('up')
    })
    kernel.call('down')
    assert.deepEqual(stack, ['down'])
    kernel.call('up')
    assert.deepEqual(stack, ['down', 'up'])
  })

  test('passing arrow function to inline command should throw exception', async (assert) => {
    const fn = () => kernel.command('down', () => {
      return 'down called'
    })
    assert.throw(fn, 'Inline command handler cannot be an arrow function')
  })

  test('throw exception if command does not inherits the base command', async (assert) => {
    class Generator {}
    const fn = () => kernel.addCommand(Generator)
    assert.throw(fn, 'Make sure Generator extends the base command')
  })

  test('throw exception when command doesn\'t exists', async (assert) => {
    assert.plan(1)
    try {
      await kernel.call('make:controller')
    } catch ({ message }) {
      assert.equal(message, 'make:controller is not a registered command')
    }
  })

  test('report command errors', (assert, done) => {
    assert.plan(2)

    kernel.command('down', function () {
      throw new Error('down exploded')
    })

    kernel.onError(function (error, name) {
      assert.equal(error.message, 'down exploded')
      assert.equal(name, 'down')
      done()
    })

    kernel.commands.down.wireUpWithCommander()

    process.argv = ['node', 'test', 'down']
    kernel.invoke({ version: '1.0.0' })
  })
})
