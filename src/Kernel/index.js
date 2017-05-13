'use strict'

/*
 * adonis-ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const _ = require('lodash')
const commander = require('../../lib/commander')
const chalk = require('chalk')
const WHITE_SPACE = ''

class Kernel {
  constructor () {
    this.commands = {}
  }

  /**
   * Returns group of commands under a given namespace. Commands
   * by splitted by `:` and the first item inside the array
   * is used as the namespace. All commands without a
   * namespace are grouped under the root namespace.
   *
   * @method _groupCommands
   *
   * @return {Object}
   *
   * @private
   */
  _groupCommands () {
    return _.groupBy(this.commands, (command) => {
      const parts = command.commandName.split(':')
      return parts.length === 1 ? 'a' : parts[0]
    })
  }

  /**
   * Returns the biggest command name length
   *
   * @package {Array} options
   *
   * @method _largestCommandLength
   *
   * @return {String}
   *
   * @private
   */
  _largestCommandLength (options) {
    const keys = _.keys(this.commands).concat(options)
    return _.maxBy(keys, (command) => command.length).length
  }

  /**
   * Push group commands and namespace to the strings
   * array
   *
   * @method _pushGroups
   *
   * @param  {String}    name
   * @param  {Array}    commands
   * @param  {Number}    maxWidth
   * @param  {Array}    strings
   *
   * @return {void}
   *
   * @private
   */
  _pushGroups (name, commands, maxWidth, ctx, strings) {
    /**
     * Only push the group name when it is not `a`. A
     * is actual a group of all top level commands.
     * The reason we choose a, so that we can
     * keep top-level commands at the top after
     * sorting
     */
    if (name !== 'a') {
      strings.push(` ${ctx.magenta.bold(name)}`)
    }

    /**
     * Push each command to the strings array
     */
    _.each(_.sortBy(commands, 'commandName'), (command) => {
      strings.push(`  ${ctx.blue(_.padEnd(command.commandName, maxWidth))} ${command.description}`)
    })
  }

  /**
   * Adding a new command
   *
   * @method addCommand
   *
   * @param  {Class}   command
   */
  addCommand (command) {
    command.boot()
    this.commands[command.commandName] = command
  }

  /**
   * Wiring up each command with commander
   *
   * @method wireUpWithCommander
   *
   * @return {void}
   */
  wireUpWithCommander () {
    _.each(this.commands, (command) => {
      command.wireUpWithCommander()
    })
  }

  /**
   * Returns the command class using it's name
   *
   * @method getCommand
   *
   * @param  {String}   name
   *
   * @return {Class}
   */
  getCommand (name) {
    return this.commands[name]
  }

  /**
   * Executes the command using it's name
   *
   * @method execCommand
   *
   * @param  {String}    name
   * @param  {Object}    args
   * @param  {Object}    options
   *
   * @return {Mixed}
   */
  execCommand (name, args = {}, options = {}) {
    return this.getCommand(name).exec(args, options, false)
  }

  /**
   * Invokes commander to process the argv
   * and run command.
   *
   * @method invoke
   *
   * @return {void}
   */
  invoke () {
    commander.parse(process.argv)

    /**
     * Handling global options
     */
    if (commander.env) {
      process.env.NODE_ENV = commander.env
    }

    /**
     * Disable colored output
     */
    process.env.NO_ANSI = !!commander.noAnsi
  }

  /**
   * Returns a multiline string to be used for showing
   * the help screen.
   *
   * @method outputHelp
   *
   * @param  {Object}   options
   *
   * @return {Array}
   */
  outputHelp (options, colorize = process.env.NO_ANSI === 'false') {
    const strings = []
    const ctx = new chalk.constructor({ enabled: colorize })
    const commandsGroup = this._groupCommands()
    const groupNames = _.keys(commandsGroup).sort()
    const maxWidth = this._largestCommandLength(_.map(options, (option) => option.long)) + 2

    /**
     * Usage lines
     */
    strings.push(ctx.magenta.bold('Usage:'))
    strings.push('  command [arguments] [options]')

    /**
     * Only print global options when they exists.
     */
    if (_.size(options)) {
      strings.push(WHITE_SPACE)
      strings.push(ctx.magenta.bold('Global Options:'))
      _.each(options, (option) => {
        strings.push(`  ${ctx.blue(_.padEnd(option.long, maxWidth))} ${option.description}`)
      })
    }

    /**
     * Only print commands when they are available
     */
    if (_.size(groupNames)) {
      strings.push(WHITE_SPACE)
      strings.push(ctx.magenta.bold('Available Commands:'))
      _.each(groupNames, (groupName) => {
        this._pushGroups(groupName, commandsGroup[groupName], maxWidth, ctx, strings)
      })
    }

    strings.push(WHITE_SPACE)
    return strings.join('\n')
  }
}

const kernel = new Kernel()

/**
 * When command is not registered with ace
 */
commander.on('*', function (args) {
  console.log(`\n  error: \`${args[0]}\` is not a registered command \n`)
  process.exit(1)
})

/**
 * Customized help screen by overriding below
 * method on commander.
 */
commander.Command.prototype.outputHelp = function () {
  /**
   * Output help for a single command
   */
  if (this._name && this.parent) {
    process.stdout.write(kernel.getCommand(this._name).outputHelp(true))
    process.exit()
  }

  process.stdout.write(kernel.outputHelp(this.options))
}

commander.option('--env <environment>', 'Set NODE_ENV before running the commands')
commander.option('--no-ansi', 'Disable colored output')

module.exports = kernel
