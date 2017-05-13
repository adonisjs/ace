'use strict'

/*
 * adonis-ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

/**
 * Commander default exports is a global command instance which
 * may get conflicted with other modules using commander. We
 * want ace to be clean and use noconflict mode.
 */
const commander = require('commander')
exports = module.exports = new commander.Command()
exports.Command = commander.Command
exports.Option = commander.Option
