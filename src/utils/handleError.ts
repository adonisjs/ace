/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import logger, { Logger } from '@poppinss/fancy-logs'
import { CommandFlagException } from '../Exceptions/CommandFlagException'
import { InvalidCommandException } from '../Exceptions/InvalidCommandException'
import { CommandArgumentException } from '../Exceptions/CommandArgumentException'

/**
 * Handles the command errors and prints them to the console.
 */
export function handleError (
  error: any,
  callback?: ((error: any, loggerFn: Logger) => void | Promise<void>),
) {
  if (error instanceof CommandArgumentException) {
    const { argumentName } = error
    logger.error(`Missing argument "${argumentName}"`)
    return
  }

  if (error instanceof CommandFlagException) {
    const { argumentName, exceptedType } = error
    const message = `Expected "${argumentName}" to be a valid "${exceptedType}"`
    logger.error(message)
    return
  }

  if (error instanceof InvalidCommandException) {
    logger.error(error.message)
    return
  }

  if (typeof (callback) === 'function') {
    callback(error, logger)
  } else {
    logger.fatal(error)
  }
}
