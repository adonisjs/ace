'use strict'

/**
 * adonis-ace
 * Copyright(c) 2015-2015 Harminder Virk
 * MIT Licensed
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
  returnValue.name = field.replace('?', '')
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
