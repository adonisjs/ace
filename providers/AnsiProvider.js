'use strict'

/**
 * adonis-ace
 * Copyright(c) 2015-2015 Harminder Virk
 * MIT Licensed
*/

const ServiceProvider = require('adonis-fold').ServiceProvider

class AnsiProvider extends ServiceProvider {

  * register () {
    this.app.bind('Adonis/Src/Ansi', function () {
      return require('../src/Ansi')
    })
  }

}

module.exports = AnsiProvider
