'use strict'

/**
 * adonis-ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/
/* global describe, it, beforeEach */
const chai = require('chai')
const expect = chai.expect
const Command = require('../../src/Command')
const Kernel = require('../../src/Console/Kernel')
require('co-mocha')

describe('Kernel', function () {
  beforeEach(function () {
    this.kernel = new Kernel()
  })

  it('should be able to register an array of commands', function () {
    class MakeController extends Command {
      constructor () {
        super()
        this.command = {
          _name: 'make:controller'
        }
      }
      initialize () {}
    }
    class MakeModel extends Command {
      constructor () {
        super()
        this.command = {
          _name: 'make:model'
        }
      }
      initialize () {}
    }
    this.kernel.register([MakeController, MakeModel])
    expect(this.kernel.commands['make:controller'] instanceof MakeController).to.equal(true)
    expect(this.kernel.commands['make:model'] instanceof MakeModel).to.equal(true)
  })

  it('should be able to add a single command', function () {
    class MakeController extends Command {
      constructor () {
        super()
        this.command = {
          _name: 'make:controller'
        }
      }
      initialize () {}
    }
    this.kernel.add(MakeController)
    expect(this.kernel.commands['make:controller'] instanceof MakeController).to.equal(true)
    expect(this.kernel.commands['make:model']).to.equal(undefined)
  })

  it('should throw an error when command does not inherit Base Command', function () {
    class MakeController {}
    const fn = () => {
      this.kernel.add(MakeController)
    }
    expect(fn).to.throw(/must be an instance of Base Command/)
  })

  it('should be able to call a given command asynchronously using console kernel', function * () {
    class ModelGenerator extends Command {
      get signature () {
        return 'make:model {name} {-m, --migration}'
      }

      getName () {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve('foo')
          }, 10)
        })
      }

      * handle (args, options) {
        return yield this.getName()
      }
    }
    const kernel = new Kernel()
    kernel.add(new ModelGenerator())
    const name = yield kernel.call('make:model')
    expect(name).to.equal('foo')
  })

  it('should be able to pass arguments to the command using console kernel', function * () {
    class ModelGenerator extends Command {
      get signature () {
        return 'make:model {name} {-m, --migration}'
      }

      * handle (args, options) {
        return args.name
      }
    }
    const kernel = new Kernel()
    kernel.add(new ModelGenerator())
    const name = yield kernel.call('make:model', ['Users'])
    expect(name).to.equal('Users')
  })

  it('should throw an error when command does not exists', function * () {
    class ModelGenerator extends Command {
      get signature () {
        return 'make:model {name} {-m, --migration}'
      }

      * handle (args, options) {
        return args.name
      }
    }
    const kernel = new Kernel()
    kernel.add(new ModelGenerator())
    try {
      yield kernel.call('make:foo')
      expect(true).to.equal(false)
    } catch (e) {
      expect(e.name).to.equal('CommandNotFound')
      expect(e.message).to.match(/make:foo is not registered with ace/)
    }
  })
})
