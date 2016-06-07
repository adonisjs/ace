'use strict'

/**
 * adonis-ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const Question = require('../../Question')
const _ = require('lodash')

const Prompt = exports = module.exports = {}

/**
 * normalizes options into an consumable array
 * to the sent to inquirer.
 *
 * @param   {Array} choices
 *
 * @return  {Array}
 *
 * @private
 */
Prompt._normalizeOptions = function (choices, defaults) {
  defaults = defaults || []
  const isPlainArray = _.isArray(choices)
  return _.map(choices, (choice, key) => {
    let choicePair = {}
    if (isPlainArray) {
      choicePair = {name: choice, value: choice, checked: defaults.indexOf(choice) > -1}
    } else {
      choicePair = {name: choice, value: key, checked: defaults.indexOf(key) > -1}
    }
    return choicePair
  })
}

/**
 * creates an input type question
 *
 * @method ask
 *
 * @param  {String} question
 * @param  {String} defaultValue
 * @return {Object}              instance of new Question
 *
 * @public
 */
Prompt.ask = function (question, defaultValue) {
  return new Question({type: 'input', message: question, default: defaultValue})
}

/**
 * creates a list type question
 *
 * @method choice
 *
 * @param  {String} question
 * @param  {Array}  choices
 * @param  {String} defaultValue
 * @return {Object}              instance of new Question
 *
 * @public
 */
Prompt.choice = function (question, choices, defaultValue) {
  return new Question({type: 'list', message: question, default: defaultValue, choices: choices})
}

/**
 * creates an expand type question
 *
 * @method anticipate
 *
 * @param  {String} question
 * @param  {Array}  choices
 * @param  {String} defaultValue
 * @return {Object}              instance of new Question
 *
 * @public
 */
Prompt.anticipate = function (question, choices, defaultValue) {
  return new Question({type: 'expand', message: question, default: defaultValue, choices: choices})
}

/**
 * creates a checkbox type question
 *
 * @method multiple
 *
 * @param  {String} question
 * @param  {Array}  choices
 * @param  {String} defaults
 * @return {Object}              instance of new Question
 *
 * @public
 */
Prompt.multiple = function (question, choices, defaults) {
  const choiceHash = Prompt._normalizeOptions(choices, defaults)
  return new Question({type: 'checkbox', message: question, choices: choiceHash})
}

/**
 * creates a password type question
 *
 * @method secure
 *
 * @param  {String} question
 * @param  {String} defaultValue
 * @return {Object}              instance of new Question
 *
 * @public
 */
Prompt.secure = function (question, defaultValue) {
  return new Question({type: 'password', message: question, default: defaultValue})
}

/**
 * creates a confirm type question
 *
 * @method confirm
 *
 * @param  {String} question
 * @param  {String} defaultValue
 * @return {Object}              instance of new Question
 *
 * @public
 */
Prompt.confirm = function (question, defaultValue) {
  return new Question({type: 'confirm', message: question, default: defaultValue})
}
