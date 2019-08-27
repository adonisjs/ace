/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { Exception } from '@poppinss/utils'
import { CommandConstructorContract } from '../Contracts'

/**
 * Raised when an the type of a flag is not as one of the excepted type
 */
export class InvalidFlagType extends Exception {
  public command?: CommandConstructorContract
  public argumentName: string
  public exceptedType: string

  /**
   * Flag type validation failed.
   */
  public static invoke (
    prop: string,
    expected: string,
    command?: CommandConstructorContract,
  ): InvalidFlagType {
    const message = `${prop} must be defined as a ${expected}`

    const exception = new InvalidFlagType(message, 500, 'E_INVALID_TYPE')
    exception.argumentName = prop
    exception.command = command

    return exception
  }
}
