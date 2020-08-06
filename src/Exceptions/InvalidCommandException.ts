/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'
import { SerializedCommand } from '../Contracts'

/**
 * Raised when command is not registered with kernel
 */
export class InvalidCommandException extends Exception {
	public commandName: string
	public suggestions: SerializedCommand[] = []

	public static invoke(
		commandName: string,
		suggestions: SerializedCommand[]
	): InvalidCommandException {
		const message = `"${commandName}" is not a registered command`
		const exception = new this(message, 500, 'E_INVALID_COMMAND')
		exception.commandName = commandName
		exception.suggestions = suggestions
		return exception
	}
}
