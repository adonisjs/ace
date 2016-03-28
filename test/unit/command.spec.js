'use strict'

/**
 * adonis-ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const chai = require('chai')
const expect = chai.expect
const program = require('commander')
const Command = require('../../src/Command')

/* global describe, it */
describe('Command', function () {
  it('should be able to set command description as a getter', function () {
    class MigrationRun extends Command {
      get description () {
        return 'Run all pending migrations'
      }
    }
    const migration = new MigrationRun()
    expect(migration.description).to.equal('Run all pending migrations')
  })

  it('should be able to add a new argument to the command', function () {
    class Generator extends Command {
      constructor () {
        super()
        this.addArgument('file')
      }
    }
    const generator = new Generator()
    expect(generator.args[0]).deep.equal({name: 'file', required: true})
  })

  it('should be able to add a new option to the command', function () {
    class Generator extends Command {
      constructor () {
        super()
        this.addOption('-p, --plain')
      }
    }
    const generator = new Generator()
    expect(generator.options[0]).deep.equal({name: '-p, --plain', required: true, description: '', acceptsValue: false})
  })

  it('should be able to define a new command', function () {
    class Generator extends Command {
      constructor () {
        super()
        this.setName('make:controller')
      }
    }
    const generator = new Generator()
    expect(generator.command._name).to.equal('make:controller')
  })

  it('should define the complete command options inside the initialize method', function () {
    class Generator extends Command {
      constructor () {
        super()
        this.setName('make:controller')
        this.addArgument('name', true)
        this.addOption('-p, --plain', false, 'Keep your controller plain')
      }
    }
    const generator = new Generator()
    generator.initialize()
    expect(generator.command.options).to.be.an('array')
    expect(generator.command.options.length).to.equal(1)
    expect(generator.command.options[0].flags).to.equal('-p, --plain')
    expect(generator.command._args).to.be.an('array')
    expect(generator.command._args.length).to.equal(1)
    expect(generator.command._args[0].name).to.equal('name')
    expect(generator.command._args[0].required).to.equal(true)
  })

  it('should be able to define optional argument', function () {
    class Generator extends Command {
      constructor () {
        super()
        this.setName('make:controller')
        this.addArgument('name', false)
      }
    }
    const generator = new Generator()
    generator.initialize()
    expect(generator.command._args[0].required).to.equal(false)
  })

  it('should be able to accept value for an option', function () {
    class Generator extends Command {
      constructor () {
        super()
        this.setName('make:controller')
        this.addOption('--plain', true, 'Make plain controller', true)
      }
    }
    const generator = new Generator()
    generator.initialize()
    expect(generator.command.options[0].required).not.to.equal(0)
    expect(generator.command.options[0].flags).to.equal('--plain <value>')
  })

  it('should be able to accept optional value for an option', function () {
    class Generator extends Command {
      constructor () {
        super()
        this.setName('make:controller')
        this.addOption('--plain', false, 'Make plain controller', true)
      }
    }
    const generator = new Generator()
    generator.initialize()
    expect(generator.command.options[0].flags).to.equal('--plain [value]')
  })

  it('should define command action on initialize', function () {
    class Generator extends Command {
      constructor () {
        super()
        this.setName('make:controller')
        this.addOption('--plain', false, 'Make plain controller', true)
      }
    }
    const generator = new Generator()
    generator.initialize()
    expect(generator.command.action).to.be.a('function')
  })

  it('should call command handle method when action is invoked', function () {
    class Generator extends Command {
      constructor () {
        super()
        this.setName('make:controller')
        this.addOption('--plain', false, 'Make plain controller', true)
        this.handleCalled = false
      }
      * handle () {
        this.handleCalled = true
      }
    }
    const generator = new Generator()
    generator.initialize()
    program.parse(['node', 'test', 'make:controller', 'User'])
    expect(generator.handleCalled).to.equal(true)
  })

  it('should return null for command signature by default', function () {
    class Generator extends Command {
    }
    const generator = new Generator()
    expect(generator.signature).to.equal(null)
  })

  it('should return null for command description by default', function () {
    class Generator extends Command {
    }
    const generator = new Generator()
    expect(generator.description).to.equal(null)
  })

  it('should have setup method defined by default', function () {
    class Generator extends Command {
    }
    const generator = new Generator()
    expect(generator.setup).to.be.a('function')
  })

  it('should parse command signature when defined', function () {
    class Generator extends Command {
      get signature () {
        return 'make:controller {name} {-p, --plain=@value}'
      }
    }
    const generator = new Generator()
    generator.initialize()
    expect(generator.command.options).to.be.an('array')
    expect(generator.command.options.length).to.equal(1)
    expect(generator.command.options[0].flags).to.equal('-p, --plain <value>')
    expect(generator.command.options[0].required).not.to.equal(0)
    expect(generator.command._args).to.be.an('array')
    expect(generator.command._args.length).to.equal(1)
    expect(generator.command._args[0].name).to.equal('name')
    expect(generator.command._args[0].required).to.equal(true)
  })

  it('should parse options into sequential array', function () {
    class Generator extends Command {}
    const generator = new Generator()
    const parsedOptions = generator._parseOptions({admin: true, queue: 'default'})
    expect(parsedOptions).deep.equal(['--admin', '--queue', 'default'])
  })

  it('should remove the flag when value passed is falsy', function () {
    class Generator extends Command {}
    const generator = new Generator()
    const parsedOptions = generator._parseOptions({admin: true, queue: false})
    expect(parsedOptions).deep.equal(['--admin'])
  })

  it('should be able to execute a given command with in a different command', function () {
    const commandData = {}
    class ModelGenerator extends Command {
      get signature () {
        return 'make:model {name} {-m, --migration}'
      }
      * handle (args, options) {
        commandData.args = args
        commandData.options = options
      }
    }
    class ControllerGenerator extends Command {}
    new ModelGenerator().initialize()
    const controller = new ControllerGenerator()
    controller.run('make:model', ['UserModel'], {migration: true})
    expect(commandData.args).deep.equal({name: 'UserModel'})
    expect(commandData.options).deep.equal({migration: true})
  })
})
