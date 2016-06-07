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
const _ = require('lodash')
const Ansi = require('./Mixins/Ansi')
const Prompt = require('./Mixins/Prompt')
const Runner = require('./Mixins/Runner')
const Parser = require('../Parser')
const mixin = require('es6-class-mixin')
const co = require('co')

class Command {

  constructor () {
    this.parsed = false
    this.options = []
    this.args = []
    this.command = null
  }

  /**
   * register option with commander
   *
   * @param  {Object}        option [description]
   *
   * @private
   */
  _registerOption (option) {
    const value = option.required ? '<value>' : '[value]'
    const name = option.acceptsValue ? `${option.name} ${value}` : option.name
    this.command.option(name, option.description)
  }

  /**
   * register argument with commander
   *
   * @param  {Object}        arg [description]
   *
   * @private
   */
  _registerArgument (arg) {
    const name = arg.required ? `<${arg.name}>` : `[${arg.name}]`
    this.command.arguments(name)
  }

  /**
   * executes as a commander action to normalize all
   * values and pass them to the custom handle
   * method.
   *
   * @private
   */
  _commanderAction () {
    const self = this
    const args = _.toArray(arguments)
    const paramsLength = this.args.length
    const commandOptions = args[paramsLength]
    const params = {}
    const options = {}
    _.each(_.take(args, paramsLength), (value, index) => {
      params[this.args[index].name] = value || null
    })
    _.each(commandOptions._events, (option, name) => {
      options[name] = commandOptions[name] || null
    })
    this.setup()
    co(function * () {
      yield self.handle(params, options)
    })
  }

  /**
   * returns command signature. Signature is used
   * to define command expectations
   *
   * @return {String}
   *
   * @public
   */
  get signature () {
    return null
  }

  /**
   * returns commands description used to output
   * help.
   *
   * @return {String}    [description]
   *
   * @public
   */
  get description () {
    return null
  }

  /**
   * set command name to be used in order to
   * call the command.
   *
   * @param  {String} name [description]
   *
   * @public
   */
  setName (name) {
    this.command = commander.command(name).description(this.description)
  }

  /**
   * adds a new argument to the command expectations.
   *
   * @param  {String}    name     [description]
   * @param  {Boolean}    required [description]
   *
   * @public
   */
  addArgument (name, required) {
    required = typeof (required) !== 'undefined' ? required : true
    this.args.push({name, required})
  }

  /**
   * adds a new options to the command expectations.
   *
   * @param  {String}  name         [description]
   * @param  {Boolean}  required     [description]
   * @param  {String}  description  [description]
   * @param  {Boolean}  acceptsValue [description]
   *
   * @public
   */
  addOption (name, required, description, acceptsValue) {
    required = typeof (required) !== 'undefined' ? required : true
    acceptsValue = typeof (acceptsValue) !== 'undefined' ? acceptsValue : false
    description = description || ''
    this.options.push({name, required, description, acceptsValue})
  }

  /**
   * parses command signatue and register all options
   * and arguments.
   *
   * @private
   */
  _parseSignature () {
    if (this.signature) {
      const signatureHash = this.signature.split(' ')
      const commandName = signatureHash[0]
      this.setName(commandName)
      const commandOptions = Parser.parseSignature(_.tail(signatureHash).join(' '))
      _.each(commandOptions.args, (arg) => {
        this.addArgument(arg.name, !arg.optional)
      })
      _.each(commandOptions.flags, (flag) => {
        this.addOption(flag.name, !flag.optional, flag.description, flag.defaultValue === '@value')
      })
    }
  }

  /**
   * initializes command by registering all options with
   * commander.
   *
   * @public
   */
  initialize () {
    const self = this
    this._parseSignature()
    _.each(this.options, (option) => this._registerOption(option))
    _.each(this.args, (arg) => this._registerArgument(arg))
    this.command.action(function () {
      self._commanderAction.apply(self, arguments)
    })
  }

  /**
   * a method called by console kernel just before the handle method.
   * It can be a good place to setup command requirements, example
   * setting up the database connection
   *
   * @public
   */
  setup () {
  }

  /**
   * one should implement this method to handle the
   * console command.
   *
   * @public
   */
  * handle () {
    console.log(`Make sure to implement handle method for ${this.command.name()} command`)
  }
}

class ExtendedCommand extends mixin(Command, Ansi, Prompt, Runner) {
}

module.exports = ExtendedCommand
