'use strict'

/**
 * adonis-ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const debug = require('debug')('adonis:ace')

/**
 * The parser class is used to parse the user
 * signature into tokens of arguments and
 * options.
 *
 * @class Parser
 * @static
 */
class Parser {
  constructor () {
    this._argumentsRegex = /{(-*.[^}]+)}/g
    this._defaultValueRegex = /(.+)=(.+)/
  }

  /**
   * Extracts description from the field signature and
   * also returns a new copy of field without signature.
   *
   * So `age:Enter your age` will return ['age', 'Enter your age']
   *
   * @method _extractDescription
   *
   * @param  {String}            field
   *
   * @return {Array}
   *
   * @private
   */
  _extractDescription (field) {
    return field.includes(':') ? field.split(':') : [field, '']
  }

  /**
   * Extracts the default value from the field and
   * returns a new copy of field by removing
   * default value from it.
   *
   * So `name=virk` will return ['name', 'virk']
   *
   * @method _extractDefaultValue
   *
   * @param  {String}             field
   *
   * @return {Array}
   *
   * @private
   */
  _extractDefaultValue (field) {
    let defaultValue = null
    field = field.replace(this._defaultValueRegex, function (group, part1, part2) {
      defaultValue = part2.trim()
      return part1.trim()
    })
    return [field, defaultValue]
  }

  /**
   * Find whether field is optional or not. If field
   * is optional, it returns a new string by removing
   * the `?` from it.
   *
   * In brief `name?` will return [name, true]
   *
   * @method _extractOptional
   *
   * @param  {String}         field
   *
   * @return {Array}
   *
   * @private
   */
  _extractOptional (field) {
    const isOptional = field.endsWith('?')
    return isOptional ? [field.replace(/\?$/, ''), isOptional] : [field, isOptional]
  }

  /**
   * Parses a field by performing a series of transformations
   * and extracting the useful information from it.
   *
   * @method _parseField
   *
   * @param  {String}    field
   *
   * @return {Object}
   *
   * @private
   */
  _parseField (field) {
    debug('parsing signature option %s', field)

    /**
     * Here we do a series of transforms. For example
     * --age?=@value:Enter your age
     *
     * 1. Extract description - Returns ['--age?=@value', 'Enter your age']
     * 2. Extract default value - Returns ['--age?', '@value']
     * 3. Extract optional - Returns ['--age', true]
     *
     * So finally we have everything we need and it is tolerant if something
     * is missing a default value for that is returned.
     */
    const [fieldWithOutDescription, description] = this._extractDescription(field)
    const [fieldWithOutDefaultValue, defaultValue] = this._extractDefaultValue(fieldWithOutDescription)
    const [name, optional] = this._extractOptional(fieldWithOutDefaultValue)

    const returnValue = {
      optional,
      defaultValue,
      name,
      description: description.trim()
    }

    debug('%j', returnValue)
    return returnValue
  }

  /**
   * Parses the signature into an object of tokens with
   * arguments and flags. Options starting with `-`
   * will be considered as flags.
   *
   * @method parseSignature
   *
   * @param  {String}       signature
   *
   * @return {Object}
   *
   * @example
   * ```js
   * parseSignature('{name} {--isAdmin?}')
   * // returns
   * {
   *   args: [
   *     {
   *       name: 'name',
   *       optional: false,
   *       description: '',
   *       defaultValue: null
   *     }
   *   ],
   *   flags: [
   *     {
   *       name: '--isAdmin',
   *       optional: true,
   *       description: '',
   *       defaultValue: null
   *     }
   *   ]
   * }
   * ```
   */
  parseSignature (signature) {
    signature = signature.replace(/\s*({|:|=|})\s*/g, '$1')
    debug('parsing signature %s', signature)

    let match
    const tokens = {
      args: [],
      options: []
    }

    /**
     * Looping over the regex matches in a string and
     * parsing them appropriately.
     */
    while ((match = this._argumentsRegex.exec(signature)) !== null) {
      const matchedValue = match[1]
      const parsedValue = this._parseField(matchedValue)
      matchedValue.startsWith('-') ? tokens.options.push(parsedValue) : tokens.args.push(parsedValue)
    }

    return tokens
  }
}

module.exports = new Parser()
