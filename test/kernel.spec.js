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
const commander = require('commander')

test.group('Kernel', (group) => {
  group.before(() => {
    commander.commands = []
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
})
