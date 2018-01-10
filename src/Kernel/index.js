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
const chalk = require('chalk')
const isArrowFunction = require('is-arrow-function')

const Command = require('../Command')
const commander = require('../../lib/commander')
const WHITE_SPACE = ''

/**
 * An Instance of kernel is exported as the
 * main module. It is used to register
 * and invoke commands on command line.
 *
 * Also ace can be used to call commands
 * manually.
 *
 * @class Kernel
 */
class Kernel {
  constructor () {
    /**
     * An object containing all the
     * registered commands.
     *
     * @type {Object}
     */
    this.commands = {}

    /**
     * Handler to listen for command errors
     *
     * @type {Function}
     */
    this._cmdErrorHandler = null
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
   * Bubbles command errors to the main error listener
   *
   * @method _bubbleError
   *
   * @param  {Object}     error
   * @param  {String}     commandName
   *
   * @return {void}
   *
   * @private
   */
  _bubbleError (error, commandName) {
    if (typeof (this._cmdErrorHandler) === 'function') {
      this._cmdErrorHandler(error, commandName)
    }
  }

  /**
   * Attach callback to listen for command errors. The
   * errors are only reported for top level commands.
   *
   * If an internal invoked command throws an exception,
   * it will be not be reported to this handler.
   *
   * @method onError
   *
   * @param  {Function} callback
   *
   * @chainable
   */
  onError (callback) {
    this._cmdErrorHandler = callback
    return this
  }

  /**
   * Adding a new command by passing a command class
   * or reference to the IoC container namespace.
   *
   * The IoC container namespace only works when `use`
   * global exists.
   *
   * @method addCommand
   *
   * @param  {Class|String}   command
   *
   * @example
   * ```js
   * class Greet extends Command {
   *   static get signature () {
   *     return 'greet'
   *   }
   * }
   *
   * ace.addCommand(Greet)
   * ```
   */
  addCommand (command) {
    /**
     * Get command if runtime has a global `use`
     * function.
     */
    if (typeof (command) === 'string' && global.use) {
      command = global.use(command)
    }

    /**
     * Each command should inherit the base command
     */
    if (command.prototype instanceof Command === false) {
      throw new Error(`Make sure ${command.name} extends the base command`)
    }

    command.boot()
    this.commands[command.commandName] = command
  }

  /**
   * Add a new inline command by defining a signature
   * description and a closure to be executed when
   * command runs.
   *
   * @method command
   *
   * @param  {String}   signature
   * @param  {String}
   * @param  {Function} handle
   *
   * @return {void}
   *
   * @example
   * ```js
   * ace.command('make:controller {name}', 'Add a controller', function () {
   * })
   *
   * // with optional description
   * ace.command('make:controller {name}', function () {
   * })
   * ```
   */
  command (signature, description, handle) {
    /**
     * Since description is optional, one can pass
     * handle method as 2nd argument too.
     */
    if (typeof (description) === 'function' && !handle) {
      handle = description
      description = ''
    }

    /**
     * Since we bind the class instance to the handler, it cannot
     * be an arrow function
     */
    if (isArrowFunction(handle)) {
      throw new Error('Inline command handler cannot be an arrow function')
    }

    class InlineCommand extends Command {
      static get signature () {
        return signature
      }

      static get description () {
        return description
      }

      handle (...input) {
        return handle.bind(this)(...input)
      }
    }
    this.addCommand(InlineCommand)
  }

  /**
   * Wiring up each command with commander. It is
   * only required when commands are invoked
   * via command line.
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
   * Returns the command class using it's name.
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
   * Executes the command using it's name.
   *
   * @method call
   *
   * @param  {String}    name
   * @param  {Object}    args
   * @param  {Object}    options
   *
   * @return {Mixed}
   *
   * @example
   * ```js
   * const output = await ace.call('greet', { name: 'virk' })
   * ```
   */
  call (name, args = {}, options = {}) {
    const command = this.getCommand(name)
    if (!command) {
      throw new Error(`${name} is not a registered command`)
    }
    return command.exec(args, options, false)
  }

  /**
   * Invokes commander to process the argv
   * and run command.
   *
   * @method invoke
   *
   * @return {void}
   */
  invoke (packageJson) {
    process.env.NO_ANSI = 'false'

    const commandName = process.argv.slice(2)
    if (!commandName || !commandName[0]) {
      return commander.outputHelp()
    }

    /**
     * Set version when exists
     */
    if (packageJson && packageJson.version) {
      commander.version(packageJson.version)
    }

    commander.once('cmd:error', this._bubbleError.bind(this))
    commander.parse(process.argv)
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

/* istanbul ignore next */
/**
 * When command is not registered with ace
 */
commander
  .command('*')
  .action(function (command) {
    console.log(`\n  error: \`${command}\` is not a registered command \n`)
    process.exit(1)
  })

/**
 * Customized help screen by overriding below
 * method on commander.
 */
commander.Command.prototype.outputHelp = function () {
  /* istanbul ignore next */
  /**
   * Output help for a single command
   */
  if (this._name && this.parent) {
    process.stdout.write(kernel.getCommand(this._name).outputHelp())
    process.exit()
  }

  process.stdout.write(kernel.outputHelp(this.options))
}

/* istanbul ignore next */
/**
 * Listen for global ansi option
 */
commander.on('ansi', function () {
  process.env.NO_ANSI = this.ansi
})

/* istanbul ignore next */
/**
 * Listen for global env option
 */
commander.on('env', function (env) {
  process.env.NODE_ENV = env
})

commander.option('--env <environment>', 'Set NODE_ENV before running the commands')
commander.option('--no-ansi', 'Disable colored output')

module.exports = kernel
