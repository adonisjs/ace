'use strict'

/**
 * adonis-ace
 * Copyright(c) 2015-2015 Harminder Virk
 * MIT Licensed
*/

const argv = require('yargs').argv
const Store = require('../Store')
const helpers = require('./helpers')
const Ansi = require('../Ansi')
const co = require('co')

let Runner = exports = module.exports = {}

/**
 * @description runs commands handle method using command name
 * @method
 * @param  {String} command
 * @param  {Object} options
 * @param  {Object} flags
 * @return {Mixed}
 * @public
 */
Runner.run = function * (command, options, flags) {
  const commandClass = Store.resolve(command)
  return yield commandClass.handle(options, flags)
}

/**
 * @description high level function to invoke a command ran on
 * command lune
 * @method invoke
 * @return {void}
 * @public
 */
/* istanbul ignore next */
Runner.invoke = function (packageFile) {
  // is a help command
  if (argv.help) {
    return helpers.makeHelp(argv, packageFile)
  }

  co(function * () {
    const commandData = helpers.executeCommand(argv, packageFile)
    if (commandData) {
      return yield Runner.run(argv._[0], commandData.args, commandData.options)
    }
  })
    .then(function (response) {
      if (response) {
        Ansi.successBg(response)
      }
    })
    .catch(function (e) {
      Ansi.errorBg(e.message)
      process.exit(1)
    })
}
