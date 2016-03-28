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
const Kernel = require('../src/Console/Kernel')
const Ioc = require('adonis-fold').Ioc
const commander = require('commander')

class Generator extends Command {
  constructor () {
    super()
    this.setName('make:controller')
    this.addOption('--plain', true, 'Make controller plain')
    this.addArgument('name', true)
    this.addArgument('age', false)
  }

  * handle (params, options) {
    const name = yield this.ask('What is your name?').print()
    const password = yield this.secure('Enter account password').print()
    const workStation = yield this.choice('What\'s your favourite work station', ['Mac', 'Linux', 'Windows']).print()
    const tools = yield this.multiple('Select required tools',  ['Adonis', 'Angular', 'Sass', 'Less', 'Ember', 'Vue'], ['Adonis']).print()
    const isDeveloper = yield this.confirm('Do you know, how to code?').print()

    this.success('your name is %s', name)
    this.success('your password is %s', password)
    this.success('work station you want is %s', workStation)
    this.success('your development tools are %s', tools.join(','))
    this.success('are you a developer - %s', isDeveloper ? 'yes' : 'no')
  }
}

Ioc.bind('Adonis/Commands/Make:Controller', function () {
  return new Generator()
})

const kernel = new Kernel()
kernel.register(['Adonis/Commands/Make:Controller'])
kernel.invoke(require('../package.json'))
