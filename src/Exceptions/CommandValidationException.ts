/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { Exception } from '@poppinss/utils'

/**
 * CommandValidationException is used when validating a command before
 * registering it with Ace.
 */
export class CommandValidationException extends Exception {
  public static invalidManifestExport (commandPath: string) {
    return new this(`make sure to have a default export from {${commandPath}}`)
  }

  public static missingCommandName (className: string) {
    return new this(`missing command name for {${className}} class`)
  }

  public static invalidSpreadArgOrder (arg: string) {
    return new this(`spread argument {${arg}} must be at last position`)
  }

  public static invalidOptionalArgOrder (optionalArg: string, currentArg: string) {
    return new this(`optional argument {${optionalArg}} must be after required argument {${currentArg}}`)
  }
}
