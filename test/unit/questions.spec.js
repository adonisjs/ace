'use strict'

/**
 * adonis-ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const chai = require('chai')
const sinon = require('sinon')
const co = require('co')
const expect = chai.expect
const Question = require('../../src/Question')

/* global describe, it */
describe('Question', function () {
  it('should be able to define question options', function () {
    const question = new Question({type: 'input', message: 'Enter your name'})
    expect(question.options).deep.equal({type: 'input', message: 'Enter your name'})
  })

  it('should attach validate method', function () {
    const question = new Question({type: 'input'})
    question.validate(function () {})
    expect(question.options.validate).to.be.a('function')
  })

  it('should call prompt method when print method invoked', function (done) {
    const question = new Question({type: 'input', message: 'What\'s your name'})
    const mock = sinon.mock(question)
    const promise = function () {
      return new Promise((resolve) => resolve({}))
    }
    mock.expects('_prompt').once().returns(promise())
    co(function * () {
      yield question.print()
    })
    .then(() => {
      mock.restore()
      question._prompt() // just to complete coverage
      done()
    })
    .catch(done)
  })
})
