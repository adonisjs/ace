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

class CommandProvider extends ServiceProvider {

  * register () {
    this.app.bind('Adonis/Src/Command', function () {
      return require('../src/Command')
    })
  }

}

module.exports = CommandProvider
