'use strict'

/**
 * adonis-ace
 * Copyright(c) 2015-2015 Harminder Virk
 * MIT Licensed
*/

const colors = require('colors')
const inquirer = require('inquirer')
const Table = require('cli-table')

const iconsMain = {
  info: colors.cyan('ℹ'),
  success: colors.green('✔'),
  warn: colors.yellow('⚠'),
  error: colors.red('✖')
}

const iconsWin = {
  info: colors.cyan('i'),
  success: colors.green('√'),
  warn: colors.yellow('‼'),
  error: colors.red('×')
}

let Ansi = exports = module.exports = {}

/**
*  @description prompt to terminal using question body
 * @method prompt
 * @param {Object} body
 * @yield {Object}
 * @private
 */
const _prompt = function *(body) {
  return new Promise(function (resolve) {
    inquirer.prompt(body, function (answers) {
      resolve(answers)
    })
  })
}

/**
 * @description build inquirer prompt based on input parameters
 * @method buildQuestion
 * @param  {String} name         Name to store value in
 * @param  {String} message      Message to print
 * @param  {String} type         Type of question to print
 * @param  {String} defaultValue
 * @return {Object}
 * @private
 */
const _buildQuestion = function (name, message, type, defaultValue) {
  let body = {type, message, name}
  if (defaultValue) {
    body.default = defaultValue
  }
  return body
}

/**
 * @description passes an array of arguments to system console
 * @method _toConsole
 * @param  {Array}   values
 * @param  {function}   method
 * @return {void}
 * @private
 */
const _toConsole = function (values, method) {
  values[0] = method(values[0])
  console.log.apply(console, values)
}

/**
 * @description displays error message with red color
 * @method error
 * @return {void}
 * @public
 */
Ansi.error = function () {
  const args = Array.prototype.slice.call(arguments)
  _toConsole(args, colors.red)
}

/**
 * @description displays error message with a red color background
 * @method error
 * @return {void}
 * @public
 */
Ansi.errorBg = function () {
  const args = Array.prototype.slice.call(arguments)
  _toConsole(args, colors.bgRed.white)
}

/**
 * @description displays success message with green color
 * @method error
 * @return {void}
 * @public
 */
Ansi.success = function () {
  const args = Array.prototype.slice.call(arguments)
  _toConsole(args, colors.green)
}

/**
 * @description displays success message with a green color background
 * @method error
 * @return {void}
 * @public
 */
Ansi.successBg = function () {
  const args = Array.prototype.slice.call(arguments)
  _toConsole(args, colors.bgGreen.white)
}

/**
 * @description displays warning message with yellow color
 * @method error
 * @return {void}
 * @public
 */
Ansi.warn = function () {
  const args = Array.prototype.slice.call(arguments)
  _toConsole(args, colors.yellow)
}

/**
 * @description displays warning message with a yellow color
 * background
 * @method error
 * @return {void}
 * @public
 */
Ansi.warnBg = function () {
  const args = Array.prototype.slice.call(arguments)
  _toConsole(args, colors.bgYellow.white)
}

/**
 * @description displays info message with blue color
 * @method error
 * @return {void}
 * @public
 */
Ansi.info = function () {
  const args = Array.prototype.slice.call(arguments)
  _toConsole(args, colors.blue)
}

/**
 * @description displays info message with a blue color
 * background
 * @method error
 * @return {void}
 * @public
 */
Ansi.infoBg = function () {
  const args = Array.prototype.slice.call(arguments)
  _toConsole(args, colors.bgBlue.white)
}

/**
 * @description Show confirm prompt
 * @method confirm
 * @param {String} question
 * @param {String} defaultValue
 * @yield {Object}
 * @public
 */
Ansi.confirm = function *(question, defaultValue) {
  const uniqueQuesId = new Date()
  const questionBody = _buildQuestion(uniqueQuesId, question, 'confirm', defaultValue)
  const answer = yield _prompt(questionBody)
  return answer[uniqueQuesId]
}

/**
 * @description prompt input question
 * @method ask
 * @param {String} question
 * @param {String} defaultValue
 * @yield {Object}
 * @public
 */
Ansi.ask = function *(question, defaultValue) {
  const uniqueQuesId = new Date()
  const questionBody = _buildQuestion(uniqueQuesId, question, 'input', defaultValue)
  const answer = yield _prompt(questionBody)
  return answer[uniqueQuesId]
}

/**
 * @description Prompt list type question
 * @method choice
 * @param {String} question
 * @param {Array} choices
 * @param {String} defaultValue
 * @yield {Object}
 * @public
 */
Ansi.choice = function *(question, choices, defaultValue) {
  const uniqueQuesId = new Date()
  let questionBody = _buildQuestion(uniqueQuesId, question, 'list', defaultValue)
  questionBody.choices = choices

  const answer = yield _prompt(questionBody)
  return answer[uniqueQuesId]
}

/**
 * @description prompt raw list question
 * @method anticipate
 * @param {String} question
 * @param {Array} choices
 * @param {String} defaultValue
 * @yield {Object}
 * @public
 */
Ansi.anticipate = function *(question, choices, defaultValue) {
  const uniqueQuesId = new Date()
  let questionBody = _buildQuestion(uniqueQuesId, question, 'expand', defaultValue)
  questionBody.choices = choices

  const answer = yield _prompt(questionBody)
  return answer[uniqueQuesId]
}

/**
 * @description prompt checkbox based question
 * @method options
 * @param {String} question
 * @param {Array} choices
 * @param {String} defaultValue
 * @yield {Object}
 * @public
 */
Ansi.options = function *(question, choices, defaultValue) {
  const uniqueQuesId = new Date()
  let questionBody = _buildQuestion(uniqueQuesId, question, 'checkbox', defaultValue)
  questionBody.choices = choices

  const answer = yield _prompt(questionBody)
  return answer[uniqueQuesId]
}

/**
 * @description prompt secure input question
 * @method secure
 * @param {String} question
 * @param {String} defaultValue
 * @yield {Object}
 * @public
 */
Ansi.secure = function *(question, defaultValue) {
  const uniqueQuesId = new Date()
  const questionBody = _buildQuestion(uniqueQuesId, question, 'password', defaultValue)
  const answer = yield _prompt(questionBody)
  return answer[uniqueQuesId]
}

/**
 * @description print a structured table using head and body
 * @method table
 * @param  {Array} head
 * @param  {Array} body
 * @public
 */
Ansi.table = function (head, body) {
  let table = new Table({
    head: head
  })
  body.forEach(function (item) {
    table.push(item)
  })
  console.log(table.toString())
}

/**
 * @description prints an icon for given type
 * @method icon
 * @param  {String} type
 * @return {void}
 * @public
 */
Ansi.icon = function (type) {
  return process.platform === 'win32' ? iconsWin[type] : iconsMain[type]
}
