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
const CE = require('../Exceptions')
const _ = require('lodash')
const Ioc = require('adonis-fold').Ioc

class ConsoleKernel {

  constructor () {
    this.commands = {}
  }

  /**
   * adds a new command to the commands list
   *
   * @param  {String|Object} command
   *
   * @public
   */
  add (command) {
    const commandInstance = this.resolveCommand(command)
    this.commands[commandInstance.command._name] = commandInstance
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
   * @param  {String|Object}       command
   *
   * @public
   */
  resolveCommand (command) {
    logger.verbose('resolving command %s', command)
    const commandInstance = Ioc.make(command)
    if (commandInstance instanceof Command === false) {
      throw new CE.InvalidArgumentException(`${command} must be an instance of Base Command`)
    }
    commandInstance.initialize()
    return commandInstance
  }

  /**
   * invoke command.
   *
   * @param  {Object} packageFile
   *
   * @public
   */
  invoke (packageFile) {
    const commandName = process.argv.slice(2)
    if (!commandName || !commandName[0]) {
      return commander.outputHelp()
    }
    if (_.keys(this.commands).indexOf(commandName[0]) <= -1) {
      return console.log(`${commandName[0]} is not registered with ace`)
    }
    commander.version(packageFile.version).parse(process.argv)
  }

  /**
   * calls a given command and returns it's output back
   *
   * @param  {String} command
   * @param  {Object} args
   * @param  {Object} options
   * @return {Mixed}
   *
   * @public
   */
  call (command, args, options) {
    const commandInstance = this.commands[command]
    if (!commandInstance) {
      throw new CE.CommandNotFound(`${command} is not registered with ace`)
    }
    const formattedArgs = {}
    _.each(args, (value, index) => { formattedArgs[commandInstance.args[index].name] = value })
    commandInstance.setup()
    return commandInstance.handle(formattedArgs, options)
  }

}

module.exports = ConsoleKernel
