'use strict'

/**
 * adonis-ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const colors = require('colors/safe')
const _ = require('lodash')
const Table = require('cli-table')

const iconsMain = {
  info: colors.cyan('ℹ'),
  success: colors.green('✔'),
  warn: colors.yellow('⚠'),
  error: colors.red('✖')
}

const iconsWin = {
  info: colors.cyan('i'),
  success: colors.green('√'),
  warn: colors.yellow('‼'),
  error: colors.red('×')
}

const Ansi = exports = module.exports = {}

/**
 * passes an array of arguments to system console
 *
 * @method _toConsole
 *
 * @param  {Array}      values
 * @param  {function}   method
 *
 * @private
 */
const _toConsole = function (values, method) {
  values[0] = method(values[0])
  console.log.apply(console, values)
}

/**
 * An alias to console.log just for the sake
 * of uniform API
 */
Ansi.log = console.log

/**
 * displays error message
 *
 * @method error
 *
 * @public
 */
Ansi.error = function () {
  _toConsole(arguments, colors.red)
}

/**
 * displays success message
 *
 * @method success
 *
 * @public
 */
Ansi.success = function () {
  _toConsole(arguments, colors.green)
}

/**
 * displays info message
 *
 * @public
 */
Ansi.info = function () {
  _toConsole(arguments, colors.blue)
}

/**
 * displays warning message
 *
 * @method warn
 *
 * @public
 */
Ansi.warn = function () {
  _toConsole(arguments, colors.yellow)
}

/**
 * returns icon to be displayed
 *
 * @method icon
 *
 * @param  {String} type
 * @return {String}
 *
 * @public
 */
Ansi.icon = function (type) {
  return process.platform === 'win32' ? iconsWin[type] : iconsMain[type]
}

/**
 * display completed action
 *
 * @method completed
 *
 * @param  {String}  name
 * @param  {String}  message
 *
 * @public
 */
Ansi.completed = function (name, message) {
  console.log(`${colors.green(name + ':')} ${message}`)
}

/**
 * display failed action
 *
 * @method failed
 *
 * @param  {String}  name
 * @param  {String}  message
 *
 * @public
 */
Ansi.failed = function (name, message) {
  console.log(`${colors.red(name + ':')} ${message}`)
}

/**
 * creates a table in the cli
 *
 * @param  {Array} head
 * @param  {Object|Array} body
 *
 * @example
 * this.table(['Name', 'Age'], [['virk', 22], ['joe', 23]])
 * this.table(['Name', 'Age'], {virk: '22', joe: 21})
 *
 * @public
 */
Ansi.table = function (head, body) {
  const table = new Table({head})
  if (_.isArray(body)) {
    _.each(body, (item) => {
      table.push(item)
    })
  } else if (_.isObject(body)) {
    _.each(body, (value, key) => {
      table.push([key, value])
    })
  }
  console.log(table.toString())
}

/**
 * access to colors modules
 */
Ansi.colors = colors
