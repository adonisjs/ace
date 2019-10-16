/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { Colors } from '@poppinss/colors'
import logger from '@poppinss/fancy-logs'
import { CommandConstructorContract } from '../Contracts'
import { InvalidFlagType } from '../Exceptions/InvalidFlagType'
import { MissingCommandArgument } from '../Exceptions/MissingCommandArgument'

const colors = new Colors()

/**
 * Prints additional help for a given command
 */
function printAdditionalHelp (command?: CommandConstructorContract) {
  if (!command) {
    return
  }

  const commandHelp = colors.yellow(`adonis ${command.commandName} --help`)
  const message = `Consult the command help by typing ${commandHelp}`
  console.log(`            ${message}`)
}

/**
 * Handles the command errors and prints them to the console.
 */
export function handleError (error: any) {
  if (error instanceof MissingCommandArgument) {
    const { command, argumentName } = error
    logger.error(`Missing argument {${argumentName}}`)
    printAdditionalHelp(command)
    return
  }

  if (error instanceof InvalidFlagType) {
    const { command, argumentName, exceptedType } = error
    const message = `Expected {${argumentName}} to be a valid {${exceptedType}}`
    logger.error(message)
    printAdditionalHelp(command)
    return
  }

  logger.fatal(error)
}
