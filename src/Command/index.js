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
const fs = require('fs-extra')
const mustache = require('mustache')
const Table = require('cli-table')

const Question = require('../Question')
const parser = require('../Parser')
const commander = require('../../lib/commander')

const WHITE_SPACE = ''
const QUESTION_METHODS = ['ask', 'confirm', 'multiple', 'choice', 'secure', 'anticipate', 'on']

/**
 * Command argument and options defaults
 *
 * @type {Object}
 */
const defaults = {
  name: null,
  optional: false,
  description: '',
  defaultValue: null
}

/**
 * The base command is supposed to be extended by
 * every other command to work properly.
 *
 * @class Command
 * @static
 */
class Command {
  constructor () {
    this.chalk = new chalk.constructor({ enabled: process.env.NO_ANSI === 'false' })

    /**
     * List of icons
     *
     * @type {Object}
     */
    this.iconsMain = {
      info: this.chalk.cyan('ℹ'),
      success: this.chalk.green('✔'),
      warn: this.chalk.yellow('⚠'),
      error: this.chalk.red('✖')
    }

    /**
     * The icons to be used on windows
     *
     * @type {Object}
     */
    this.iconsWin = {
      info: this.chalk.cyan('i'),
      success: this.chalk.green('√'),
      warn: this.chalk.yellow('‼'),
      error: this.chalk.red('×')
    }
  }
  /**
   * Returns a string for registered arguments
   * to be displayed in the help output.
   *
   * @method _stringifyArgs
   * @static
   *
   * @return {String}
   *
   * @private
   */
  static _stringifyArgs () {
    return _.map(this.args, this._getArgOrOptionName.bind(this)).join(' ')
  }

  /**
   * Validates the existence of name on an argument/option.
   *
   * @method _validateName
   * @static
   *
   * @param  {String}      name
   *
   * @return {void}
   *
   * @throws {Error} If name is missing
   *
   * @private
   */
  static _validateName (name) {
    if (!name) {
      throw new Error(`Cannot register argument without a name on ${this.commandName} command`)
    }
  }

  /**
   * Check whether command is not booted or not.
   *
   * @method _ensureIsBooted
   * @static
   *
   * @return {void}
   *
   * @throws {Error} If booted is not set to true
   *
   * @private
   */
  static _ensureIsBooted () {
    if (!this._booted) {
      throw new Error(`Make sure to call ${this.name}.boot before adding arguments or options`)
    }
  }

  /**
   * Returns formatted argument or option name to be used
   * for help screen or when registering values with
   * commander.
   *
   * @method _getArgOrOptionName
   * @static
   *
   * @param  {Object}       input
   *
   * @return {String}
   *
   * @private
   */
  static _getArgOrOptionName (input) {
    /**
     * For option
     */
    if (input.name.startsWith('-')) {
      const value = input.optional ? '[value]' : '<value>'
      return input.defaultValue === '@value' ? `${input.name} ${value}` : input.name
    }

    /**
     * For argument
     */
    return input.optional ? `[${input.name}]` : `<${input.name}>`
  }

  /**
   * Intitate class properties by defining them. Since
   * these properties are static inheritance breaks
   * and we need to define it on each class.
   *
   * @method _initiate
   * @static
   *
   * @return {void}
   *
   * @private
   */
  static _initiate () {
    this._booted = false
    this._name = ''
    this.command = null
    this.args = []
    this.options = []
  }

  /**
   * Binds the commander instance to the command
   * static interface.
   *
   * @method _bindCommander
   * @static
   *
   * @return {void}
   *
   * @private
   */
  static _bindCommander () {
    this.command = commander.command(this.commandName).description(this.description)
  }

  /**
   * Register all arguments with commander.
   *
   * @method _registerArgsWithCommander
   * @static
   *
   * @return {void}
   *
   * @private
   */
  static _registerArgsWithCommander () {
    this.command.arguments(this._stringifyArgs().trim())
  }

  /**
   * Registers all options with commander.
   *
   * @method _registerOptionsWithCommander
   * @static
   *
   * @return {void}
   *
   * @private
   */
  static _registerOptionsWithCommander () {
    _.each(this.options, (option) => {
      this.command.option(this._getArgOrOptionName(option), option.description)
    })
  }

  /**
   * The command name getter. Only define when
   * you are not defining the signature.
   *
   * @attribute commandName
   * @static
   *
   * @return {String}
   */
  static get commandName () {
    return this._name
  }

  /**
   * The command signature getter to define the
   * command name, arguments and options.
   *
   * @attribute signature
   * @static
   *
   * @return {String}
   */
  static get signature () {
    return ''
  }

  /**
   * The command description getter.
   *
   * @attribute description
   * @static
   *
   * @return {String}
   */
  static get description () {
    return ''
  }

  /**
   * Add an argument to the command. Below is the list of
   * allowed values.
   *
   * You only define arguments manually when you have
   * not defined the `signature`.
   *
   * - **name** - The argument name
   * - **optional=false** - Whether or not argument is optional
   * - **defaultValue=null** - Default value
   * - **description** - The argument description
   *
   * @method addArgument
   * @static
   *
   * @param  {Object}    arg
   *
   * @chainable
   *
   * @example
   * ```js
   * static boot () {
   *   super.boot()
   *
   *   this.addArgument({ name: 'name', optional: true })
   *
   *   // default Value
   *   this.addArgument({ name: 'name', defaultValue: 'foo' })
   * }
   * ```
   */
  static addArgument (arg = {}) {
    this._ensureIsBooted()
    let mergedArg = {}
    _.merge(mergedArg, defaults, arg)
    this._validateName(mergedArg.name)
    this.args.push(mergedArg)
    return this
  }

  /**
   * Add an option to the command. Below is the list of
   * allowed values.
   *
   * You only define options manually when you have
   * not defined the `signature`.
   *
   * - **name** - The option name
   * - **optional=false** - Whether or not option is optional
   * - **defaultValue=null** - Default value
   * - **description** - The option description
   *
   *
   * @method addOption
   * @static
   *
   * @param  {Object}  option
   *
   * @chainable
   *
   * @example
   * ```js
   * static boot () {
   *   super.boot()
   *
   *   this.addOption({ name: '--file', optional: true })
   *
   *    // default Value
   *    this.addOption({ name: '--file', defaultValue: 'UserController' })
   * }
   * ```
   */
  static addOption (option = {}) {
    this._ensureIsBooted()
    let mergedOption = {}
    _.merge(mergedOption, defaults, option)
    this._validateName(mergedOption.name)
    this.options.push(mergedOption)
    return this
  }

  /**
   * Parses the signature by tokenizing the string
   * and set the command name, also set arguments
   * and options by calling `addArgument` and
   * `addOption` methods.
   *
   * This method is called automatically by the
   * `boot` method.
   *
   * @method parseSignature
   * @static
   *
   * @return {void}
   */
  static parseSignature () {
    if (this.signature) {
      const [name, ...tokens] = this.signature.trim().split(' ')
      this._name = name.trim()
      const parsedTokens = parser.parseSignature(tokens.join(' '))
      _.each(parsedTokens.args, this.addArgument.bind(this))
      _.each(parsedTokens.options, this.addOption.bind(this))
    }
  }

  /**
   * Returns the length of the biggest name inside args and
   * options both. It is required to have a symmetrical
   * help screen.
   *
   * When there are no args or options, 0 is returned.
   *
   * @method biggestArg
   * @static
   *
   * @return {Number}
   */
  static biggestArg () {
    const option = _.maxBy(this.args.concat(this.options), (arg) => this._getArgOrOptionName(arg).length)
    return option && option.name ? this._getArgOrOptionName(option).length : 0
  }

  /**
   * Returns a multiline string to be used as the help
   * output. This method does not write anything to
   * console and consumer to should do it
   * themselves.
   *
   * @method outputHelp
   * @static
   *
   * @param  {Boolean}  colorize - Whether or not colorize the output
   *
   * @return {String}
   */
  static outputHelp (colorize = process.env.NO_ANSI === 'false') {
    const ctx = new chalk.constructor({ enabled: colorize })
    const stringifiedArgs = this._stringifyArgs()
    const maxWidth = this.biggestArg()

    /**
     * Push new lines to the strings array
     *
     * @type {Array}
     */
    const strings = []

    /**
     * Push the strings showing how to use the
     * command.
     *
     * @type {String}
     */
    strings.push(ctx.magenta.bold('Usage:'))
    const args = stringifiedArgs.length ? ` ${stringifiedArgs}` : ''
    strings.push(`  ${this.commandName}${args} [options]`)

    /**
     * Push arguments when defined
     */
    if (this.args.length) {
      strings.push(WHITE_SPACE)
      strings.push(ctx.magenta.bold('Arguments:'))
      _.each(this.args, (arg) => {
        strings.push(`  ${ctx.blue(_.padEnd(arg.name, maxWidth))} ${arg.description}`)
      })
    }

    /**
     * Push options when defined
     */
    if (this.options.length) {
      strings.push(WHITE_SPACE)
      strings.push(ctx.magenta.bold('Options:'))
      _.each(this.options, (option) => {
        strings.push(`  ${ctx.blue(_.padEnd(this._getArgOrOptionName(option), maxWidth))} ${option.description}`)
      })
    }

    /**
     * Push description when defined
     */
    if (this.description) {
      strings.push(WHITE_SPACE)
      strings.push(ctx.magenta.bold('About:'))
      strings.push(`  ${this.description}`)
    }

    strings.push(WHITE_SPACE)
    return strings.join('\n')
  }

  /**
   * Initializes the command by parsing the signature and
   * register arguments/options on command.
   *
   * Don't do anything if command has already be booted.
   *
   * @method boot
   * @static
   *
   * @return {void}
   *
   * @chainable
   *
   * @throws {Error} If command does not have a name.
   */
  static boot () {
    if (this._booted) {
      return this
    }

    this._initiate()
    this._booted = true
    this.parseSignature()

    /**
     * If command name is not defined, even after parsing the
     * signature throw an exception.
     */
    if (!this.commandName) {
      throw new Error('Make sure to define the command name')
    }

    return this
  }

  /**
   * Wires the command attributes to commander, so
   * that commander can run the command when
   * someone executes it via commandline.
   *
   * @method wireUpWithCommander
   * @static
   *
   * @return {void}
   */
  static wireUpWithCommander () {
    this._bindCommander()
    this._registerArgsWithCommander()
    this._registerOptionsWithCommander()
    this.command.action(this.commanderAction.bind(this))
    return this
  }

  /**
   * The commander action executed everytime command is
   * executed via command line.
   *
   * @method commanderAction
   * @static
   *
   * @param  {...Spread}     input
   *
   * @return {Mixed}
   */
  static commanderAction (...input) {
    const command = _.last(input)

    /**
     * Commander passes all args to the action parameters, we
     * just need to map the values to the name of the argument
     * and make a flat object out of it.
     */
    const args = _.transform(_.initial(input), (result, arg, index) => {
      result[this.args[index].name] = arg || this.args[index].defaultValue || null
      return result
    }, {})

    /**
     * Options to be passed to the handle method
     */
    const options = _.transform(command.opts(), (result, option, name) => {
      result[name] = result[name] = command.hasOwnProperty(name) ? command[name] : null
      return result
    }, {})

    this
      .exec(args, options, true)
      .catch((error) => {
        commander.emit('cmd:error', error, this.commandName)
      })
  }

  /**
   * Executes the command handle method by initiating
   * a new instance of command.
   *
   * @method exec
   * @static
   *
   * @param  {Object} args
   * @param  {Object} options
   * @param  {Boolean} viaAce
   *
   * @return {Mixed}
   */
  static exec (args, options, viaAce) {
    const commandInstance = typeof (global.make) === 'function' ? global.make(this) : new this()
    commandInstance.viaAce = viaAce

    return new Promise(async (resolve, reject) => {
      try {
        const response = await commandInstance.handle(args, options)
        resolve(response)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * The handle method to be executed
   * when running command
   *
   * @method handle
   *
   * @return {void}
   */
  handle () {
    throw new Error(`Make sure to implement handle method for ${this.constructor.commandName} command`)
  }

  /* istanbul ignore next */
  /**
   * Log info message to the console with cyan
   * color.
   *
   * @method info
   *
   * @param  {...Spread} input - Multiple messages
   *
   * @return {void}
   *
   * @example
   * ```js
   * this.info('Something worth sharing')
   * ```
   */
  info (...input) {
    console.log(this.chalk.cyan(...input))
  }

  /* istanbul ignore next */
  /**
   * Log warn message to the console with yellow color.
   * Also this method will use `console.warn` instead
   * of `console.log`
   *
   * @method warn
   *
   * @param  {...Spread} input - Multiple messages
   *
   * @return {void}
   *
   * @example
   * ```js
   * this.warn('Fire in the hole')
   * ```
   */
  warn (...input) {
    console.warn(this.chalk.yellow(...input))
  }

  /* istanbul ignore next */
  /**
   * Log success message to the console with green color.
   *
   * @method success
   *
   * @param  {...Spread} input - Multiple messages
   *
   * @return {void}
   *
   * @example
   * ```js
   * this.success('All went fine')
   * ```
   */
  success (...input) {
    console.log(this.chalk.green(...input))
  }

  /* istanbul ignore next */
  /**
   * Log error message to the console with red color.
   * Also this method will use `console.error`
   * instead of `console.log`
   *
   * @method error
   *
   * @param  {...Spread} input - Multiple messages
   *
   * @return {void}
   *
   * @example
   * ```js
   * this.error('Something is broken')
   * ```
   */
  error (...input) {
    console.error(this.chalk.red(...input))
  }

  /* istanbul ignore next */
  /**
   * Print an action with message to the console
   *
   * @method completed
   *
   * @param  {String}  action
   * @param  {String}  message
   *
   * @return {void}
   *
   * @example
   * ```js
   * this.completed('create', 'Created controller file')
   * ```
   */
  completed (action, message) {
    console.log(`${this.chalk.green(action + ':')} ${message}`)
  }

  /* istanbul ignore next */
  /**
   * Print failed action the console. Also `console.error`
   * is used over `console.log`
   *
   * @method failed
   *
   * @param  {String} action
   * @param  {String} message
   *
   * @return {void}
   *
   * @example
   * ```js
   * this.failed('create', 'File already exists')
   * ```
   */
  failed (action, message) {
    console.error(`${this.chalk.red(action + ':')} ${message}`)
  }

  /* istanbul ignore next */
  /**
   * Print table to the command line.
   *
   * @method table
   *
   * @param  {Array} head
   * @param  {Array} body
   * @param  {Object} [style = {}]
   *
   * @return {void}
   *
   * @example
   * ```js
   * this.table(['Name', 'Age'], [['virk', 22], ['joe', 23]])
   * this.table(['Name', 'Age'], {virk: '22', joe: 21})
   * this.table(['Name', 'Age'], {virk: '22', joe: 21}, {head: ['red']})
   * ```
   */
  table (head, body, style = { head: ['cyan'] }) {
    const table = new Table({head, style})
    if (_.isArray(body)) {
      _.each(body, (item) => {
        table.push(item)
      })
    } else if (_.isPlainObject(body)) {
      _.each(body, (value, key) => {
        table.push([key, value])
      })
    }
    console.log(table.toString())
  }

  /* istanbul ignore next */
  /**
   * Returns a colored icon for a given type. Allowed
   * types are `info`, `warn`, `success` and `error`.
   *
   * @method icon
   *
   * @param  {String} type
   *
   * @return {String}
   */
  icon (type) {
    return process.platform === 'win32' ? this.iconsWin[type] : this.iconsMain[type]
  }

  /* istanbul ignore next */
  /**
   * Write file to a given location if parent
   * directory/directories does not exists
   * they will be created
   *
   * @method writeFile
   * @async
   *
   * @param  {String}  file
   * @param  {String}  content
   * @param  {Object}  options
   *
   * @return {Promise}
   */
  writeFile (file, content, options) {
    return fs.outputFile(file, content, options)
  }

  /* istanbul ignore next */
  /**
   * Empty the directory by removing everything
   * from it but not the directory itself.
   *
   * @method emptyDir
   * @async
   *
   * @param  {String} dir
   *
   * @return {Promise}
   */
  emptyDir (dir) {
    return fs.emptyDir(dir)
  }

  /* istanbul ignore next */
  /**
   * Make sure the file exists, otherwise create the
   * empty file.
   *
   * @method ensureFile
   * @async
   *
   * @param  {String}   file
   *
   * @return {Promise}
   */
  ensureFile (file) {
    return fs.ensureFile(file)
  }

  /* istanbul ignore next */
  /**
   * Ensure a directory exists or create one
   *
   * @method ensureDir
   * @async
   *
   * @param  {String}  dir
   *
   * @return {Promise}
   */
  ensureDir (dir) {
    return fs.ensureDir(dir)
  }

  /* istanbul ignore next */
  /**
   * Returns a boolean indicating whether file
   * exists or not.
   *
   * @method pathExists
   * @async
   *
   * @param  {String}   file
   *
   * @return {Promise}
   */
  pathExists (file) {
    return fs.pathExists(file)
  }

  /* istanbul ignore next */
  /**
   * Removes the file from the disk
   *
   * @method removeFile
   * @async
   *
   * @param  {String}   file
   *
   * @return {Promise}
   */
  removeFile (file) {
    return fs.remove(file)
  }

  /* istanbul ignore next */
  /**
   * Read file from the disk
   *
   * @method readFile
   * @async
   *
   * @param  {String} file
   * @param  {String} [encoding]
   *
   * @return {String}
   */
  readFile (file, encoding) {
    return fs.readFile(file, encoding)
  }

  /* istanbul ignore next */
  /**
   * Removes directory
   *
   * @method removeDir
   * @async
   *
   * @param  {String}  dir
   *
   * @return {Promsie}
   */
  removeDir (dir) {
    return fs.remove(dir)
  }

  /* istanbul ignore next */
  /**
   * Copy file from src directory to destination
   *
   * @method copy
   * @async
   *
   * @param  {String} src
   * @param  {String} dest
   * @param  {Object} [options = {}]
   *
   * @return {Promise}
   */
  copy (src, dest, options) {
    return fs.copy(src, dest, options)
  }

  /* istanbul ignore next */
  /**
   * Move file from src directory to destination
   *
   * @method move
   * @async
   *
   * @param  {String} src
   * @param  {String} dest
   * @param  {Object} [options = {}]
   *
   * @return {Promise}
   */
  move (src, dest, options) {
    return fs.move(src, dest, options)
  }

  /**
   * Generate file from a mustache template. In the process
   * it will make sure that file does not exists before
   * creating it.
   *
   * @method generateFile
   * @async
   *
   * @param  {String}     file
   * @param  {String}     template
   * @param  {Object}     data
   *
   * @return {Promise}
   *
   * @throws {Error} If file already exists.
   */
  async generateFile (file, template, data) {
    const exists = await this.pathExists(file)
    if (exists) {
      throw new Error(`${file} already exists`)
    }

    const output = mustache.render(template, data)
    return this.writeFile(file, output)
  }
}

/* istanbul ignore next */
/**
 * Add all question methods to the command prototype and
 * each method will instantiate the question class
 * and calls the method
 */
QUESTION_METHODS.forEach((method) => {
  Command.prototype[method] = function (...input) {
    return new Question()[method](...input)
  }
})

module.exports = Command
