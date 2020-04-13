/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { Colors } from '@poppinss/colors'
import logger, { Logger } from '@poppinss/fancy-logs'
import { CommandFlagException } from '../Exceptions/CommandFlagException'
import { InvalidCommandException } from '../Exceptions/InvalidCommandException'
import { CommandArgumentException } from '../Exceptions/CommandArgumentException'

const colors = new Colors()

/**
 * Handles the command errors and prints them to the console.
 */
export function handleError (
  error: any,
  callback?: ((error: any, loggerFn: Logger) => void | Promise<void>),
) {
  if (error instanceof CommandArgumentException) {
    logger.error(`Missing argument "${error.argumentName}"`)
    return
  }

  if (error instanceof CommandFlagException) {
    const message = `Expected "${error.argumentName}" to be a valid "${error.exceptedType}"`
    logger.error(message)
    return
  }

  if (error instanceof InvalidCommandException) {
    const hasSuggestions = error.suggestions && error.suggestions.length
    logger.error(`"${error.commandName}" command not found${hasSuggestions ? ', did you mean' : ''}`)

    error.suggestions.forEach(({ commandName, description }) => {
      console.log(`${colors.green(commandName)}   ${colors.dim(description)}`)
    })
    return
  }

  if (typeof (callback) === 'function') {
    callback(error, logger)
  } else {
    logger.fatal(error)
  }
}
