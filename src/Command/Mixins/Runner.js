'use strict'

/**
 * adonis-ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const _ = require('lodash')
const commander = require('commander')
const Runner = exports = module.exports = {}

/**
 * runs a command by passing it arguments and options
 *
 * @method run
 *
 * @param  {String} command [description]
 * @param  {Array} args    [description]
 * @param  {Object} options [description]
 *
 * @public
 */
Runner.run = function (command, args, options) {
  const finalCommand = ['ace', 'run'].concat([command]).concat(args).concat(this._parseOptions(options))
  commander.parse(finalCommand)
}

/**
 * parses options to command line arguments to
 * be parsed by commander later
 *
 * @method _parseOptions
 *
 * @param  {Object}      options [description]
 * @return {Object}              [description]
 *
 * @private
 */
Runner._parseOptions = function (options) {
  const parsedOptions = []
  _.each(options, function (value, name) {
    if (!value) {
      return
    }
    name = `--${name}`
    parsedOptions.push(name)
    if (value !== true) {
      parsedOptions.push(value)
    }
  })
  return parsedOptions
}
