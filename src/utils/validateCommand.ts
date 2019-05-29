/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { CommandConstructorContract, CommandArg } from '../Contracts'
import { CommandValidationException } from '../Exceptions/CommandValidationException'

/**
 * Validates the command static properties to ensure that all the
 * values are correctly defined for a command to be executed.
 */
export function validateCommand (command: CommandConstructorContract) {
    /**
   * Ensure command has a name
   */
  if (!command.commandName) {
    throw CommandValidationException.missingCommandName(command.name)
  }

  let optionalArg: CommandArg

  command.args.forEach((arg, index) => {
    /**
     * Ensure optional arguments comes after required
     * arguments
     */
    if (optionalArg && arg.required) {
      throw CommandValidationException.invalidOptionalArgOrder(optionalArg.name, arg.name)
    }

    /**
     * Ensure spread arg is the last arg
     */
    if (arg.type === 'spread' && command.args.length > index + 1) {
      throw CommandValidationException.invalidSpreadArgOrder(arg.name)
    }

    if (!arg.required) {
      optionalArg = arg
    }
  })
}
