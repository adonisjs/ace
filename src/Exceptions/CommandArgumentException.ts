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
 * Raised when an argument is missing but excepted
 */
export class CommandArgumentException extends Exception {
	public command: CommandConstructorContract
	public argumentName: string

	/**
	 * A required argument is missing
	 */
	public static invoke(
		name: string,
		command: CommandConstructorContract
	): CommandArgumentException {
		const message = `missing required argument "${name}"`

		const exception = new this(message, 500, 'E_MISSING_ARGUMENT')
		exception.argumentName = name
		exception.command = command

		return exception
	}
}
