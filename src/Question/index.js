'use strict'

/**
 * adonis-ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const inquirer = require('inquirer')

class Question {
  constructor (options) {
    this.options = options
  }

  /**
   * adds a validate handler for a given
   * question.
   *
   * @param  {Function} callback
   * @return {Object}            instance of question for chaining methods
   *
   * @public
   */
  validate (callback) {
    this.options.validate = callback
    return this
  }

  /**
   * prompts for a question
   *
   * @return {Object}
   *
   * @private
   *
   */
  _prompt () {
    return inquirer.prompt(this.options)
  }

  /**
   * prints question on the terminal
   *
   * @return {Mixed}
   *
   * @public
   */
  * print () {
    this.options.name = new Date().getTime()
    const answer = yield this._prompt()
    return answer[this.options.name]
  }
}

module.exports = Question
