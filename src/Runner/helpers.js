'use strict'

/**
 * adonis-ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const Store = require('../Store')
const Parser = require('../Parser')
const Help = require('terminal-help')
const Ansi = require('../Ansi')

const globalOptions = [
  {
    name: '--help',
    description: 'Get help for all ace commands'
  },
  {
    name: '--version',
    description: 'Get framework version'
  }
]

let helpers = exports = module.exports = {}

/**
 * @description makes help screen for all the commands
 * @method makeHelp
 * @param  {Object} argv
 * @return {void}
 * @public
 */
helpers.makeHelp = function (argv, packageFile) {
  /* istanbul ignore next */
  const command = argv._[0] ? argv._[0] : argv.help
  const commands = helpers.getCommands()
  const options = {
    package: packageFile,
    commands: commands,
    options: globalOptions
  }

  /**
   * if help option has a string next to it, display
   * help for that command
   */
  /* istanbul ignore if */
  if (typeof (command) === 'string') {
    return Help.forCommand(command, options)
  }

  /**
   * display help for all commands
   */
  Help.menu(options)
}

/**
 * @description convets a command to an object with its options, arguments
 * and meta data
 * @method makeCommand
 * @param  {String}    command
 * @return {Object}
 * @public
 * @throws multiple errors
 */
helpers.makeCommand = function (command) {
  const resolvedCommand = Store.resolve(command)
  const description = resolvedCommand.description
  const requirements = Parser.parseSignature(resolvedCommand.signature)
  return {
    name: command,
    description: description,
    arguments: requirements.args,
    options: requirements.flags
  }
}

/**
 * @description resolves a command to an object with its options, arguments
 * and meta data
 * @method getCommand
 * @param  {String}    command
 * @return {Object}
 * @public
 * @throws multiple errors
 */
helpers.getCommand = function (command) {
  const resolvedCommand = Store.get(command)
  const description = resolvedCommand.description
  const requirements = Parser.parseSignature(resolvedCommand.signature)
  return {
    name: command,
    description: description,
    arguments: requirements.args,
    options: requirements.flags
  }
}

/**
 * @description resolves all commands registered inside ace
 * store
 * @method getCommands
 * @return {Array}
 * @public
 */
helpers.getCommands = function () {
  const commands = Store.getCommands()
  const formattedCommands = []
  Object.keys(commands).forEach(function (command) {
    formattedCommands.push(helpers.getCommand(command))
  })
  return formattedCommands
}

/**
 * @description executes a command by resolving it from ioc container
 * validation is handled automatically
 * @method executeCommand
 * @param  {Object}       argv
 * @return {Object}
 * @throws multiple errors
 * @public
 */
helpers.executeCommand = function (argv, packageFile) {
  const command = argv._[0]

  /**
   * it command does not exists re-run the help
   * command
   */
  if (!command) {
    return helpers.makeHelp(argv, packageFile)
  }

  const commandOptions = helpers.getCommand(command)
  return helpers.validateAndTransform(commandOptions.arguments, commandOptions.options, argv)
}

/**
 * @description returns item value based upon terminal input
 * @method getValue
 * @param  {Object} item
 * @param  {Object} argv
 * @param  {Number} index
 * @param  {String} type
 * @return {String}
 * @public
 */
helpers.getValue = function (item, argv, index, type) {
  if (type === 'option') {
    /**
     * fetch value for original flag
     */
    let value = argv[item.name.replace('--', '')]

    /**
     * otherwise fetch value for a given alias
     */
    if (!value) {
      item.aliases.forEach(function (alias) {
        if (argv[alias]) {
          value = argv[alias]
        }
      })
    }

    /**
     * finally set value to the default value
     */
    if (!value) {
      value = item.defaultValue
    }
    return value
  }
  return argv._[index + 1] || item.defaultValue
}

/**
 * @description validates the input from command lien with command signature and throws
 * errors if there are any or return the formatted options and arguments
 * @method validateAndTransform
 * @param  {Array}             args
 * @param  {Array}             options
 * @param  {Object}             argv
 * @return {Object}
 * @public
 */
helpers.validateAndTransform = function (args, options, argv) {
  let formattedArgs = {}
  let formattedOptions = {}

  args.forEach(function (item, index) {
    item.value = helpers.getValue(item, argv, index, 'argument')
    if (!item.optional && !item.value) {
      throw new Error(`${item.name} is required`)
    }
    formattedArgs[item.name] = item.value
  })

  options.forEach(function (item, index) {
    item.value = helpers.getValue(item, argv, index, 'option')
    if (!item.optional && !item.value) {
      throw new Error(`${item.name} is required`)
    }
    formattedOptions[item.name.replace('--', '')] = item.value
  })
  return {args: formattedArgs, options: formattedOptions}
}

/**
 * shows framework version
 *
 * @method showVersion
 *
 * @param  {Object}    packageFile
 *
 * @public
 */
helpers.showVersion = function (packageFile) {
  console.log(`${Ansi.colors.green(packageFile.name)} ${Ansi.colors.white('version')} ${Ansi.colors.yellow(packageFile.version)}`)
}
