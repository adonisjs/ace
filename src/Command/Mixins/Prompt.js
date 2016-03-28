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
 * @param  {String} defaultValue
 * @return {Object}              instance of new Question
 *
 * @public
 */
Prompt.multiple = function (question, choices, defaultValue) {
  let choiceHash = []
  _.each(choices, (choice) => {
    if (typeof (choice) === 'string') {
      choiceHash.push({name: choice})
    } else {
      choiceHash.push(choice)
    }
  })
  return new Question({type: 'checkbox', message: question, default: defaultValue, choices: choiceHash})
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
