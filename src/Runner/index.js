'use strict'

/**
 * adonis-ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const argv = require('yargs').argv
const Store = require('../Store')
const helpers = require('./helpers')
const Ansi = require('../Ansi')
const CatLog = require('cat-log')
const logger = new CatLog('adonis:ace')
const co = require('co')

const Runner = exports = module.exports = {}

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
  logger.verbose('executing %s handle method', command)
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

  // looking for version
  if (argv.version) {
    return helpers.showVersion(packageFile)
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
