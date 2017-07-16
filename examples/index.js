'use strict'

/*
 * adonis-ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const kernel = require('../src/kernel')

kernel.command(
  'greet {name?: Enter the name of the person you want to greet} { --is-admin }',
  'Greet a user',
  async function ({ name }) {
    const validateName = function (input) {
      return !input ? 'Enter your name' : true
    }
    name = name || await this.on('validate', validateName).ask('Can u share your name')
    this.success(`Hello ${name}`)
  }
)

kernel.wireUpWithCommander()
kernel.invoke()
