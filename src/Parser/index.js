'use strict'

/**
 * adonis-ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

let Parser = exports = module.exports = {}
const argumentsRegex = /{(-*.[^}]+)}/g
const defaultValueRegex = /(.+)\=(.+)/

/**
 * @description parse a given option to pull meta data from
 * it, it can contain keywords to define optional values,
 * defaults and description
 * @method _parseField
 * @param  {String}   field
 * @return {Object}
 * @private
 */
const _parseField = function (field) {
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
  const nameWithAlias = Parser.parseFlagWithAlias(name)
  returnValue.isFlag = Parser.isFlag(name)
  returnValue.name = nameWithAlias.name
  returnValue.aliases = nameWithAlias.aliases
  returnValue.alias = nameWithAlias.alias
  return returnValue
}

/**
 * tells whether an option is a flag or not.
 *
 * @method isFlag
 *
 * @param  {String}  name
 * @return {Boolean}
 *
 * @public
 */
Parser.isFlag = function (name) {
  return name.startsWith('--')
}

/**
 * parses the name and extract it's aliases from it.
 *
 * @method parseFlagWithAlias
 *
 * @param  {String}           name
 * @return {Object}
 *
 * @public
 */
Parser.parseFlagWithAlias = function (name) {
  const nameParts = name.split('|')
  const returnValue = {
    name: null,
    aliases: [],
    alias: null
  }
  if (nameParts.length <= 1) {
    returnValue.name = nameParts[0]
    return returnValue
  }
  returnValue.name = `--${nameParts.pop()}`
  nameParts[0] = nameParts[0].replace('--', '')
  returnValue.aliases = nameParts
  returnValue.alias = `--[${nameParts.join('|')}]`
  return returnValue
}

/**
 * @description parses command signature to pull arguments
 * and flags from string
 * @method parseSignature
 * @param  {String}       signature
 * @return {Object}
 * @public
 */
Parser.parseSignature = function (signature) {
  let match
  let parsed = {
    args: [],
    flags: []
  }
  while ((match = argumentsRegex.exec(signature)) !== null) {
    const matchedValue = match[1]
    if (matchedValue.startsWith('--')) {
      parsed.flags.push(_parseField(matchedValue))
    } else {
      parsed.args.push(_parseField(matchedValue))
    }
  }
  return parsed
}
