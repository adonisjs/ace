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

const validateName = function (input) {
  return !input ? 'Enter your name' : true
}

const validatePassword = function (input) {
  return !input ? 'Enter password' : true
}

const validateChoice = function (input) {
  return input.length < 1 ? 'Select alteast 2 choices' : true
}

kernel.command(
  'greet {name?: Enter the name of the person you want to greet} { --is-admin }',
  'Greet a user',
  async function () {

    /**
     * Ask name
     */
    const name = await this
      .on('validate', validateName)
      .on('filter', (i) => i.toUpperCase())
      .ask('Can u share your name', null)

    /**
     * Delete files
     */
    const deleteFiles = await this
      .confirm('Are you sure you want to delete selected files?')

    /**
     * Password
     */
    const password = await this
      .on('validate', validatePassword)
      .secure('What is your password?')

    /**
     * Lunch time
     */
    const lunch = await this
      .on('validate', validateChoice)
      .multiple(
        'Friday lunch ( 2 per person )',
        [
          'Roasted vegetable lasagna',
          'Vegetable & feta cheese filo pie',
          'Roasted Cauliflower + Aubergine'
        ],
        [
          'Roasted Cauliflower + Aubergine'
        ]
      )

    /**
     * Npm client
     */
    const client = await this
      .choice('Client to use for installing dependencies', [
        {
          name: 'Use yarn',
          value: 'yarn'
        },
        {
          name: 'Use npm',
          value: 'npm'
        }
      ], 'npm')

    /**
     * Action
     */
    const action = await this
      .anticipate('Conflict in server.js', [
        {
          name: 'Skip and continue',
          key: 's',
          value: 'skip'
        },
        {
          name: 'Delete',
          key: 'd',
          value: 'delete'
        }
      ])

    console.log('name >        ', name)
    console.log('deleteFiles > ', deleteFiles)
    console.log('password >    ', password)
    console.log('lunch >       ', lunch.join(', '))
    console.log('client >      ', client)
    console.log('action >      ', action)
  }
)

kernel.wireUpWithCommander()
kernel.invoke()
