'use strict'

/**
 * adonis-ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const commander = require('commander')
const Command = require('../Command')
const CatLog = require('cat-log')
const logger = new CatLog('adonis:ace')
const NE = require('node-exceptions')
const _ = require('lodash')
const Ioc = require('adonis-fold').Ioc

class ConsoleKernel {

  constructor () {
    this.commands = []
  }

  /**
   * adds a new command to the commands list
   *
   * @param  {String|Object} command
   *
   * @public
   */
  add (command) {
    this.commands.push(this.resolveCommand(command))
  }

  /**
   * registers an array of commands to the
   * commands list.
   *
   * @param  {Array} command
   *
   * @public
   */
  register (commands) {
    _.each(commands, (command) => this.add(command))
  }

  /**
   * resolves a command from the Ioc container and
   * makes sure it is instance of Command.
   *
   * @param  {String|Object}       command [description]
   *
   * @public
   */
  resolveCommand (command) {
    logger.verbose('resolving command %s', command)
    const commandInstance = typeof (command) === 'string' ? Ioc.make(command) : command
    if (commandInstance instanceof Command === false) {
      throw new NE.InvalidArgumentException(`${command} must be an instance of ${Command.name}`)
    }
    commandInstance.initialize()
    commandInstance.setup()
  }

  /**
   * invoke command.
   *
   * @param  {Object} packageFile [description]
   *
   * @public
   */
  invoke (packageFile) {
    commander.version(packageFile.version).parse(process.argv)
  }

}

module.exports = ConsoleKernel
