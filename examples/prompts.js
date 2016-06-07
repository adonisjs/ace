'use strict'

/**
 * adonis-ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const Command = require('../src/Command')
const c = new Command()
const co = require('co')

co(function * () {
  const meal = yield c.choice('Choose a free daily meal', ['BreakFast', 'Lunch', 'Dinner'], 'Lunch').print()
  const sports = yield c.multiple('You Like?', ['Soccer', 'Cricket', 'BasketBall'], ['Cricket']).print()
  const languages = yield c.multiple('You know?', {
      js: 'Javascript',
      elm: 'Elm',
      hsk: 'Haskell',
      ruby: 'Ruby'
  }, ['js']).print()
  const action = yield c.anticipate('Conflict in file.js?', [{key: 'y', name: 'Delete it'}, {key: 'a', name: 'Overwrite it'}, {key: 'i', name: 'Ignore it'}], 1).print()
  console.log(`The meal I want it ${meal} as i know ${languages.join(',')} languages and also ${sports.join(',')} sports`)
  console.log(`I want to ${action}`)
}).catch(console.error)
