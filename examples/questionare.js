'use strict'

/**
 * adonis-ace
 * Copyright(c) 2015-2015 Harminder Virk
 * MIT Licensed
*/

const Console = require('../src/Console')
const co = require('co')

co(function * () {
  const name = yield Console.ask('What is you name? ', 'Harminder Virk')
  const framework = yield Console.choice('What all frameworks you use ?', ['Express', 'Koa', 'Sails', 'Adonis'])
  const party = yield Console.anticipate('Will you attend new year party', [
  {
    key: 'y',
    name: 'Yes',
    value: 'yes'
  },
  {
    key: 'n',
    name: 'No',
    value: 'no'
  },
  {
    key: 'm',
    name: 'MayBe',
    value: 'maybe'
  }
])
const food = yield Console.options('What all would like to eat', ['Chinese', 'Italian', 'Indian'])
const drive = yield Console.confirm('Will you drive')
let license = ''
if(drive) {
  license = yield Console.secure('Can i have your driving license number')
}

return {name, framework, party, food, drive, license}
}).then(function (success) {
  Console.success('Thanks for your info')
  console.log('%j', success)
}).catch(function (error) {
  Console.error(error)
})
