/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { Exception } from '@poppinss/utils'

export class InvalidArgumentException extends Exception {
  public static invalidType (prop: string, expected: string) {
    const message = `${prop} must be defined as a ${expected}`
    return new InvalidArgumentException(message, 500)
  }

  public static missingArgument (name: string) {
    const message = `missing required argument ${name}`
    return new InvalidArgumentException(message, 500)
  }
}
