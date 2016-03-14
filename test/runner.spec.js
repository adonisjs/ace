'use strict'

/**
 * adonis-ace
 * Copyright(c) 2015-2015 Harminder Virk
 * MIT Licensed
*/

const Runner = require('../src/Runner')
const runnerHelpers = require('../src/Runner/helpers')
const Store = require('../src/Store')
const Ioc = require('adonis-fold').Ioc
const chai = require('chai')
const expect = chai.expect
require('co-mocha')

describe('Runner', function () {

  beforeEach(function () {
    Store.clear()
  })

  it('should call command handle method using run method', function * () {
    class Greet {
      get description () {
        return 'foo'
      }
      * handle () {
        return 'what\'s up'
      }
    }

    Ioc.bind('App/Commands/Greet', function () {
      return new Greet()
    })
    Store.registerCommand('greet:user', 'App/Commands/Greet')
    const response = yield Runner.run('greet:user')
    expect(response).to.equal('what\'s up')
  })

  it('should make command options to be used for making help menu', function () {

    class Greet {
      get description () {
        return 'I am greet'
      }

      * handle () {

      }
     }

    Ioc.bind('App/Commands/Greet', function () {
      return new Greet()
    })
    Store.registerCommand('greet:user', 'App/Commands/Greet')
    const command = runnerHelpers.makeCommand('greet:user')
    expect(command.name).to.equal('greet:user')
    expect(command.description).to.equal(new Greet().description)
    expect(command.arguments.length).to.equal(0)
    expect(command.options.length).to.equal(0)
  })

  it('should make all commands to be used for making help menu', function () {
    class Greet {
      get description () {
        return 'I am greet'
      }
      get signature () {
        return '{name}'
      }
     }

    Ioc.bind('App/Commands/Greet', function () {
      return new Greet()
    })
    Store.registerCommand('greet:user', 'App/Commands/Greet')
    const command = runnerHelpers.getCommands(['greet:user'])
    expect(command[0].name).to.equal('greet:user')
    expect(command[0].description).to.equal(new Greet().description)
    expect(command[0].arguments.length).to.equal(1)
    expect(command[0].options.length).to.equal(0)
  })

  it('should make command options to be used for making help menu with signature', function () {
    class Greet {
      get description () {
        return 'I am greet'
      }
      * handle () {
      }
      get signature () {
        return '{name:Enter name of the file} {--plain?:We will keep it plain}'
      }
     }

    Ioc.bind('App/Commands/Greet', function () {
      return new Greet()
    })
    Store.registerCommand('greet:user', 'App/Commands/Greet')
    const command = runnerHelpers.makeCommand('greet:user')
    expect(command.arguments.length).to.equal(1)
    expect(command.options.length).to.equal(1)
    expect(command.options[0].name).to.equal('--plain')
    expect(command.options[0].description).to.equal('We will keep it plain')
    expect(command.options[0].optional).to.equal(true)

    expect(command.arguments[0].name).to.equal('name')
    expect(command.arguments[0].description).to.equal('Enter name of the file')
    expect(command.arguments[0].optional).to.equal(false)
  })

  it('should return value to be bound to option inside command signature', function () {
    const argv = {
      plain: true
    }
    const item = {
      name: '--plain',
      defaultValue: false
    }
    const value = runnerHelpers.getValue(item, argv, '', 'option')
    expect(value).to.equal(true)
  })

  it('should return default value when value for option inside command signature is empty or does not exists', function () {
    const argv = {
    }
    const item = {
      name: '--plain',
      defaultValue: false,
      aliases: []
    }
    const value = runnerHelpers.getValue(item, argv, '', 'option')
    expect(value).to.equal(false)
  })

  it('should return value to be bound to argument inside command signature', function () {
    const argv = {
      _: ['', 'UserController']
    }
    const item = {
      name: 'name',
      defaultValue: '',
      aliases: []
    }
    const value = runnerHelpers.getValue(item, argv, 0, 'argument')
    expect(value).to.equal('UserController')
  })

  it('should return default value when value for argument inside command signature is empty or does not exists', function () {
    const argv = {
      _: ['']
    }
    const item = {
      name: 'name',
      defaultValue: '',
      aliases: []
    }
    const value = runnerHelpers.getValue(item, argv, 0, 'argument')
    expect(value).to.equal('')
  })

  it('should throw an error when argument is not optional and does not exists', function () {
    const argv = {
      _: ['']
    }
    const args = [
      {
        name: 'name',
        optional: false,
        defaultValue: ''
      }
    ]
    const fn = function () {
      return runnerHelpers.validateAndTransform(args, [], argv)
    }
    expect(fn).to.throw(/name is required/)
  })

  it('should throw not an error when argument is optional and does not exists', function () {
    const argv = {
      _: []
    }
    const args = [
      {
        name: 'name',
        optional: true,
        defaultValue: ''
      }
    ]
    runnerHelpers.validateAndTransform(args, [], argv)
  })

  it('should throw an error when option is not optional and does not exists', function () {
    const argv = {
    }
    const options = [
      {
        name: '--plain',
        optional: false,
        defaultValue: '',
        aliases: []
      }
    ]
    const fn = function () {
      return runnerHelpers.validateAndTransform([], options, argv)
    }
    expect(fn).to.throw(/--plain is required/)
  })

  it('should not throw an error when option is optional and does not exists', function () {
    const argv = {
    }
    const options = [
      {
        name: '--plain',
        optional: true,
        defaultValue: '',
        aliases: []
      }
    ]
    runnerHelpers.validateAndTransform([], options, argv)
  })

  it('should return options value when it is present', function () {
    const argv = {
      plain: true
    }
    const options = [
      {
        name: '--plain',
        optional: true,
        defaultValue: '',
        aliases: []
      }
    ]
    const response = runnerHelpers.validateAndTransform([], options, argv)
    expect(response.options.plain).to.equal(true)
  })

  it('should catch errors throw while executing non-existing command', function () {
    const packageFile = require('../package.json')
    const argv = {
      _: ['make:controller']
    }
    const fn = function () {
      return runnerHelpers.executeCommand(argv, packageFile)
    }
    expect(fn).to.throw(/make:controller is not registered/)
  })

  it('should return undefined when no command is ran and output help screen', function () {
    const packageFile = require('../package.json')
    const argv = {
      _: []
    }
    const reply = runnerHelpers.executeCommand(argv, packageFile)
    expect(reply).to.equal(undefined)
  })

  it('should return formatted options when command is valid and all expectations have been met', function () {
    const packageFile = require('../package.json')
    const argv = {
      _: ['make:controller', 'UserController']
    }
    class Make {
      get signature () {
        return '{name}'
      }
      get description () {
        return 'Make a new controller'
      }
      *handle () {

      }
    }
    Ioc.bind('App/Commands/Make', function () {
      return new Make()
    })
    Store.register({'make:controller': 'App/Commands/Make'})
    const reply = runnerHelpers.executeCommand(argv, packageFile)
    expect(reply).to.have.property('args')
    expect(reply).to.have.property('options')
    expect(reply.args.name).to.equal('UserController')
    expect(Object.keys(reply.options)).to.have.length(0)
  })

  it('should parse a command with empty signature', function () {
    const packageFile = require('../package.json')
    const argv = {
      _: ['make:controller']
    }
    class Make {
      get signature () {
      }
      get description () {
        return 'Make'
      }
      *handle () {

      }
    }
    Ioc.bind('App/Commands/Make', function () {
      return new Make()
    })
    Store.register({'make:controller': 'App/Commands/Make'})
    const reply = runnerHelpers.executeCommand(argv, packageFile)
    expect(reply).to.have.property('args')
    expect(reply).to.have.property('options')
    expect(Object.keys(reply.options)).to.have.length(0)
    expect(Object.keys(reply.args)).to.have.length(0)
  })

  it('should excute command handle with empty signature', function * () {
    const packageFile = require('../package.json')
    let handleCalled = false
    const argv = {
      _: ['make:controller']
    }
    class Make {
      get signature () {
      }
      get description () {
        return 'Make'
      }
      * handle () {
        handleCalled = true
      }
    }
    Ioc.bind('App/Commands/Make', function () {
      return new Make()
    })
    Store.register({'make:controller': 'App/Commands/Make'})
    const commandData = runnerHelpers.executeCommand(argv, packageFile)
    yield Runner.run(argv._[0], commandData.args, commandData.options)
    expect(handleCalled).to.equal(true)
  })
})
