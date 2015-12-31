'use strict'

/**
 * adonis-ace
 * Copyright(c) 2015-2015 Harminder Virk
 * MIT Licensed
*/

const Store = require('../src/Store')
const Ioc = require('adonis-fold').Ioc
const Runner = require('../src/Runner')

let Greet = {}
Greet.description = 'Greet a user'
Greet.signature = '{name}'
Greet.handle = function * (options, flags) {

}

let Make = {}
Make.description = 'Make a controller'
Make.signature = '{name} {--plain?}'
Make.handle = function * (options, flags) {
   console.log('i will make ' + options.name + ' controller for you')
}

Ioc.bind('App/Commands/Greet', function () {
  return Greet
})

Ioc.bind('App/Commands/Make', function () {
  return Make
})


Store.register(
  {
    'greet:user' : 'App/Commands/Greet',
    'make:controller' : 'App/Commands/Make',
  }
)

Runner.invoke(require('../package.json'))
