'use strict'

const Ansi = require('../src/Ansi')

Ansi.error('This is invalid')
Ansi.errorBg("%s is not a valid email and \n another line", 'foo')
Ansi.success(`${Ansi.icon('success')} it works`)
Ansi.successBg('It works')
Ansi.warn('Fire in the hole')
Ansi.warnBg('Fire in the hole')
Ansi.info('U should check it out')
Ansi.info('%j', {name: 'virk'})
Ansi.table(['name', 'age'], [['virk', 22], ['nikk', 21]])

Ansi.table([], [{name: 'virk'}, {age: 22}, {email: 'something'}])
console.log(Ansi.icon('info'))
console.log(Ansi.icon('error'))
console.log(Ansi.icon('success'))
console.log(Ansi.icon('warn'))
