'use strict'

/**
 * adonis-ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
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
