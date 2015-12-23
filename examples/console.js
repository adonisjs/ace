'use strict'

const Console = require('../src/Console')

Console.error('This is invalid')
Console.errorBg("%s is not a valid email and \n another line", 'foo')
Console.success(`${Console.icon('success')} it works`)
Console.successBg('It works')
Console.warn('Fire in the hole')
Console.warnBg('Fire in the hole')
Console.info('U should check it out')
Console.info('%j', {name: 'virk'})
Console.table(['name', 'age'], [['virk', 22], ['nikk', 21]])

Console.table([], [{name: 'virk'}, {age: 22}, {email: 'something'}])
console.log(Console.icon('info'))
console.log(Console.icon('error'))
console.log(Console.icon('success'))
console.log(Console.icon('warn'))
