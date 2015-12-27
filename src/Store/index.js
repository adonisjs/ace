'use strict'

/**
 * adonis-ace
 * Copyright(c) 2015-2015 Harminder Virk
 * MIT Licensed
*/

const Ioc = require('adonis-fold').Ioc

let commands = {}

let Store = exports = module.exports = {}

/**
 * @description returns existing commands from commands
 * store
 * @method getCommands
 * @return {Object}
 * @public
 */
Store.getCommands = function () {
  return commands
}

/**
 * @description clears existing commands
 * @method clear
 * @return {void}
 * @public
 */
Store.clear = function () {
  commands = {}
}

/**
 * @description registers an object of commands to
 * commands store
 * @method register
 * @param  {Object} hashOfCommands
 * @return {void}
 * @public
 */
Store.register = function (hashOfCommands) {
  commands = hashOfCommands
}

/**
 * @cdescription registers a command using it name and
 * namespace
 * @method registerCommand
 * @param  {String}        name
 * @param  {String}        namespace
 * @return {void}
 * @public
 */
Store.registerCommand = function (name, namespace) {
  commands[name] = namespace
}

/**
 * @description resolves commands from Ioc comtainer
 * @method resolve
 * @param  {String} command
 * @return {Mixed}
 * @public
 */
Store.resolve = function (command) {
  if (!commands[command]) {
    throw new Error(command + ' is not registered with ace')
  }
  const commandInstance = Ioc.make(commands[command])

  /**
   * throw error if command does have a handle method
   */
  if (typeof (commandInstance.handle) !== 'function') {
    throw new Error(command + ' should have a handle method')
  }

  return commandInstance
}

/**
 * @description resolves commands from Ioc comtainer
 * @method resolve
 * @param  {String} command
 * @return {Mixed}
 * @public
 */
Store.get = function (command) {
  if (!commands[command]) {
    throw new Error(command + ' is not registered with ace')
  }
  const commandClass = Ioc.use(commands[command])

  /**
   * throw error if command does have a signature or
   * description
   */
  if (!commandClass.description || !commandClass.signature) {
    throw new Error(command + ' should have a signature and description')
  }

  return commandClass
}
