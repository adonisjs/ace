'use strict'

/**
 * adonis-ace
 * Copyright(c) 2015-2015 Harminder Virk
 * MIT Licensed
*/

const ServiceProvider = require('adonis-fold').ServiceProvider

class ConsoleProvider extends ServiceProvider {

  * register () {
    this.app.bind('Adonis/Src/Console', function () {
      return require('../src/Console')
    })
  }

}

module.exports = ConsoleProvider
