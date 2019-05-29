/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { red, bgRed } from 'kleur'

/**
 * Handles the command errors and prints them to the console.
 */
export function handleError (error: any) {
  if (error.name === 'CommandValidationException') {
    console.log(red(error.message))
    console.log(bgRed('This is a programming error. Make sure to read the docs'))
    return
  }

  if (error.name === 'InvalidArgumentException') {
    console.log(bgRed('Error'))
    console.log(red(error.message))
    return
  }

  console.log(bgRed('Fatal error'))
  console.log(red(error.message))
  console.log(error.stack)
}
