'use strict'

/*
 * adonis-ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const Enquirer = require('enquirer')
const enquirer = new Enquirer()

enquirer.register('confirm', require('prompt-confirm'))
enquirer.register('password', require('prompt-password'))
enquirer.register('checkbox', require('prompt-checkbox'))
enquirer.register('list', require('prompt-list'))
enquirer.register('expand', require('prompt-expand'))

exports = module.exports = enquirer
