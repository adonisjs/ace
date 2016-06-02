'use strict'

/**
 * adonis-ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const CatLog = require('cat-log')
const logger = new CatLog('adonis:ace')

const Parser = exports = module.exports = {}
const argumentsRegex = /{(-*.[^}]+)}/g
const defaultValueRegex = /(.+)=(.+)/

/**
 * parse a given option to pull meta data. It can
 * contain keywords to define optional values,
 * defaults and description.
 *
 * @param  {String}   field
 * @return {Object}
 *
 * @private
 */
const _parseField = function (field) {
  logger.verbose('parsing signature option %s', field)
  let returnValue = {}
  let description = ''
  let defaultValue = null

  if (field.includes(':')) {
    const breakField = field.split(':')
    field = breakField[0]
    description = breakField[1].trim()
  }

  let defaultValueMatches = defaultValueRegex.exec(field)
  if (defaultValueMatches && defaultValueMatches[2]) {
    defaultValue = defaultValueMatches[2]
    field = field.replace('=' + defaultValue, '')
  }

  returnValue.optional = field.endsWith('?')
  returnValue.description = description
  returnValue.defaultValue = defaultValue
  const name = field.replace('?', '')
  returnValue.name = name
  logger.verbose('%j', returnValue)
  return returnValue
}

/**
 * parses command signature to pull arguments
 * and flags from string.
 *
 * @method parseSignature
 *
 * @param  {String}       signature
 * @return {Object}
 *
 * @public
 */
Parser.parseSignature = function (signature) {
  logger.verbose('parsing signature %s', signature)
  let match
  let parsed = {
    args: [],
    flags: []
  }
  while ((match = argumentsRegex.exec(signature)) !== null) {
    const matchedValue = match[1]
    if (matchedValue.startsWith('-')) {
      parsed.flags.push(_parseField(matchedValue))
    } else {
      parsed.args.push(_parseField(matchedValue))
    }
  }
  return parsed
}
