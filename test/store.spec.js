'use strict'

/**
 * adonis-ace
 * Copyright(c) 2015-2015 Harminder Virk
 * MIT Licensed
*/

const Store = require('../src/Store')
const Ioc = require('adonis-fold').Ioc
const chai = require('chai')
const expect = chai.expect
require('co-mocha')

describe('Store', function () {

  beforeEach(function () {
    Store.clear()
  })

  it('should register a given command to commands store', function () {
    Store.registerCommand('greet:user', 'App/Commands/Greet')
    const commands = Store.getCommands()
    expect(commands).to.be.an('object')
    expect(commands).to.have.property('greet:user')
    expect(commands['greet:user']).to.equal('App/Commands/Greet')
  })

  it('should register a given command to commands store using object', function () {
    Store.register({'greet:user': 'App/Commands/Greet'})
    const commands = Store.getCommands()
    expect(commands).to.be.an('object')
    expect(commands).to.have.property('greet:user')
    expect(commands['greet:user']).to.equal('App/Commands/Greet')
  })

  it('should resolve a command from ioc container', function () {

    class Greet {
      description () {
        return 'foo'
      }
      * handle () {
      }
    }

    Ioc.bind('App/Commands/Greet', function () {
      return new Greet()
    })
    Store.registerCommand('greet:user', 'App/Commands/Greet')
    const command = Store.resolve('greet:user')
    expect(command.description).to.equal(new Greet().description)
  })

  it('should throw an error when unable to find command', function () {

    class Greet {
      description () {
        return 'foo'
      }
      * handle () {

      }
    }

    Ioc.bind('App/Commands/Greet', function () {
      return new Greet()
    })
    Store.registerCommand('greet:user', 'App/Commands/Greet')
    const command = function () {
      return Store.resolve('greet:foo')
    }
    expect(command).to.throw(/greet:foo is not registered/i)
  })

  it('should throw an error when unable to resolve namespace from Ioc container', function () {

    class Greet {
      description () {
        return 'foo'
      }
      signature () {

      }
    }

    Ioc.bind('App/Commands/Greet', function () {
      return Greet
    })
    Store.registerCommand('greet:user', 'App/Commands/Foo')
    const command = function () {
      return Store.resolve('greet:user')
    }
    expect(command).to.throw(/Cannot find module/i)
  })

})
