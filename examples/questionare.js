'use strict'

/**
 * adonis-ace
 * Copyright(c) 2015-2015 Harminder Virk
 * MIT Licensed
*/

const Ansi = require('../src/Ansi')
const co = require('co')

co(function * () {
  const name = yield Ansi.ask('What is you name? ', 'Harminder Virk')
  const framework = yield Ansi.choice('What all frameworks you use ?', ['Express', 'Koa', 'Sails', 'Adonis'])
  const party = yield Ansi.anticipate('Will you attend new year party', [
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
const food = yield Ansi.options('What all would like to eat', ['Chinese', 'Italian', 'Indian'])
const drive = yield Ansi.confirm('Will you drive')
let license = ''
if(drive) {
  license = yield Ansi.secure('Can i have your driving license number')
}

return {name, framework, party, food, drive, license}
}).then(function (success) {
  Ansi.success('Thanks for your info')
  console.log('%j', success)
}).catch(function (error) {
  Ansi.error(error)
})
