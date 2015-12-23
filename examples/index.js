'use strict'

/**
 * adonis-ace
 * Copyright(c) 2015-2015 Harminder Virk
 * MIT Licensed
*/

const Store = require('../src/Store')
const Ioc = require('adonis-fold').Ioc
const Runner = require('../src/Runner')

class Greet {
  description () {
    return  'Greet a user'
  }
  signature () {
    return '{name}'
  }
  * handle (options, flags) {

  }
}

class Make {
  description () {
    return  'Make a controller'
  }
  signature () {
    return '{name} {--plain?}'
  }
  * handle (options, flags) {
    console.log('i will make ' + options.name + ' controller for you')
  }
}

Ioc.bind('App/Commands/Greet', function () {
  return new Greet()
})

Ioc.bind('App/Commands/Make', function () {
  return new Make()
})


Store.register(
  {
    'greet:user' : 'App/Commands/Greet',
    'make:controller' : 'App/Commands/Make',
  }
)

Runner.invoke(require('../package.json'))
