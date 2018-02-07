'use strict'

/*
 * adonis-ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const _ = require('lodash')
const enquirer = require('../../lib/enquirer')

/**
 * The enquirer has a bug where it returns
 * the name over the key, which is wrong.
 *
 * This method overrides that behavior
 *
 * @method multipleFilterFn
 *
 * @return {Array}
 */
function multipleFilterFn () {
  return this.choices.choices
    .filter((choice) => choice.checked)
    .map((choice) => choice.key)
}

/**
 * Question class makes it simple to prompt user to share
 * certain information on command line. You can ask
 * simple questions to multiple choice question.
 *
 * @class Question
 * @constructor
 */
class Question {
  constructor () {
    this._name = String(new Date().getTime())
    this._validateFn = null
    this._filterFn = null
  }

  /**
   * Returns a standard hash of question with
   * some default values. Meant to be used
   * privately.
   *
   * @method _getQuestionsHash
   *
   * @param  {Object}          question
   * @param  {Object}          [options]
   *
   * @return {Object}
   *
   * @private
   */
  _getQuestionsHash (question, options) {
    const questionHash = {
      name: this._name,
      prefix: '> '
    }

    /**
     * Add validate function to the hash when defined
     */
    if (typeof (this._validateFn) === 'function') {
      questionHash.validate = this._validateFn
    }

    /**
     * Add filter function to the hash when defined
     */
    if (typeof (this._filterFn) === 'function') {
      questionHash.filter = this._filterFn
    }

    return _.merge({}, questionHash, question, options)
  }

  /**
   * Normalizes the choices array of multiple input
   * questions and returns a standard array ready
   * to be parsed by inquirer
   *
   * @method _normalizeChoices
   *
   * @param  {Array}          choices
   *
   * @return {Array}
   *
   * @private
   */
  _normalizeChoices (choices) {
    return _.map(choices, (choice) => {
      /**
       * To be backward compatable
       */
      if (_.isPlainObject(choice)) {
        choice.key = choice.value
        delete choice.value
      }
      return choice
    })
  }

  /**
   * Listen for certain events on when they occur.
   * This is not a proper implementation of event
   * emitter, but instead a nice abstraction to
   * `validate` and `filter` the user inputs.
   *
   * Right now you can listen for `validate` and
   * `filter` events only. More details are
   * shared in the docs.
   *
   * @method on
   *
   * @param  {String}   event
   * @param  {Function} callback
   *
   * @chainable
   */
  on (event, callback) {
    if (event === 'validate') {
      this._validateFn = callback
    } else if (['filter', 'transform'].indexOf(event) > -1) {
      this._filterFn = callback
    }
    return this
  }

  /**
   * Prompts for an `input` type question.
   *
   * @method ask
   * @async
   *
   * @param  {String} question
   * @param  {String} [defaultValue = null]
   * @param  {Object} [options]
   *
   * @return {String|Null}
   *
   * @example
   * ```js
   * const name = await question.ask('Enter project name')
   *
   * // with default name
   * const name = await question.ask('Enter project name', 'yardstick')
   * ```
   */
  async ask (question, defaultValue = null, options) {
    const output = await enquirer.prompt(this._getQuestionsHash({
      type: 'input',
      message: question,
      default: defaultValue
    }, options))
    return output[this._name]
  }

  /**
   * Confirm user for an action. Choosing yes
   * will return `true` otherwise `false`.
   *
   * @method confirm
   *
   * @param  {String} question
   * @param  {Object} [options]
   *
   * @return {Boolean}
   *
   * @example
   * ```js
   * const runMigrations = await question.confirm('Do you want to migrations?')
   * ```
   */
  async confirm (question, options) {
    const output = await enquirer.prompt(this._getQuestionsHash({
      type: 'confirm',
      message: question
    }, options))

    return output[this._name]
  }

  /**
   * Prompts for an secure type questions like
   * asking for passwords, secure keys etc.
   *
   * @method secure
   * @async
   *
   * @param  {String} question
   * @param  {String} [defaultValue = null]
   * @param  {Object} [options]
   *
   * @return {String|Null}
   *
   * @example
   * ```js
   * const ghKey = await question.secure('Enter github key')
   * ```
   */
  async secure (question, defaultValue = null, options) {
    const output = await enquirer.prompt(this._getQuestionsHash({
      type: 'password',
      message: question,
      default: defaultValue
    }, options))

    return output[this._name]
  }

  /**
   * Prompt with choices option. User
   * can select multiple options too.
   *
   * @method multiple
   *
   * @param  {String}  title
   * @param  {Array}   choices
   * @param  {Array}   [selected = []]
   * @param  {Object}  [options = {}]
   *
   * @return {Array}
   *
   * @example
   * ```js
   * const lunch = await question
   *   .on('validate', function (selected) {
   *     return selected.length > 2 ? 'Cannot select more than 2' : true
   *   })
   *   .multiple('Friday lunch ( 2 per person )', [
   *     'Roasted vegetable lasagna',
   *     'Vegetable & feta cheese filo pie',
   *     'Chicken meatballs with lentil, tomato',
   *     'Carrot + Tabbouleh',
   *     'Roasted Cauliflower + Aubergine'
   *   ])
   * ```
   */
  async multiple (title, choices, selected = [], options) {
    this._filterFn = this._filterFn || multipleFilterFn

    const output = await enquirer.prompt(this._getQuestionsHash({
      type: 'checkbox',
      message: title,
      choices: this._normalizeChoices(choices),
      default: selected
    }, options))

    return output[this._name]
  }

  /**
   * Prompt a message with a choices list. User
   * can only select one option at a time.
   *
   * @method choice
   *
   * @param  {String}  title
   * @param  {Array}   choices
   * @param  {String}  [defaultChoice]
   * @param  {Object}  [options = {}]
   *
   * @return {String}
   *
   * @example
   * ```js
   * const framework = await question.choice('Which framework do you use?', [
   *   {
   *     value: 'adonisjs',
   *     name: 'AdonisJs'
   *   },
   *   {
   *     value: '....',
   *     name: 'That shiny framework'
   *   }
   * ])
   * ```
   */
  async choice (title, choices, defaultChoice = null, options) {
    const output = await enquirer.prompt(this._getQuestionsHash({
      type: 'list',
      message: title,
      choices: this._normalizeChoices(choices),
      default: defaultChoice
    }, options))

    return output[this._name]
  }

  /**
   * Ask multiple option question with a shorthand
   * key to select the answers. Also `H` key can
   * be used to expand the options and choose
   * manually over shortcut key.
   *
   * @method anticipate
   *
   * @param  {String}  title
   * @param  {Array}   choices
   * @param  {String}  defaultChoice
   * @param  {Object}  [options = {}]
   *
   * @return {String}
   *
   * @example
   * ```js
   * await question.anticipate('Conflict in server.js', [
   *   {
   *     name: 'Skip and continue',
   *     key: 's',
   *     value: 'skip'
   *   },
   *   {
   *     name: 'Delete',
   *     key: 'd',
   *     value: 'delete'
   *   }
   * ])
   * ```
   */
  async anticipate (title, choices, defaultChoice, options) {
    const output = await enquirer.prompt(this._getQuestionsHash({
      type: 'expand',
      message: title,
      choices: choices,
      default: defaultChoice
    }, options))

    return output[this._name]
  }
}

module.exports = Question
