/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { errors } from '@poppinss/prompts'
import { createError, Exception } from '@poppinss/utils'

export const E_PROMPT_CANCELLED = errors.E_PROMPT_CANCELLED

/**
 * Command is missing the static property command name
 */
export const E_MISSING_COMMAND_NAME = createError<[command: string]>(
  'Cannot serialize command "%s". Missing static property "commandName"',
  'E_MISSING_COMMAND_NAME'
)

/**
 * Cannot find a command for the given name
 */
export const E_COMMAND_NOT_FOUND = class CommandNotFound extends Exception {
  commandName: string
  constructor(args: [command: string]) {
    super(`Command "${args[0]}" is not defined`, { code: 'E_COMMAND_NOT_FOUND' })
    this.commandName = args[0]
  }
}

/**
 * Missing a required flag when running the command
 */
export const E_MISSING_FLAG = createError<[flag: string]>(
  'Missing required option "%s"',
  'E_MISSING_FLAG'
)

/**
 * Missing value for a flag that accepts values
 */
export const E_MISSING_FLAG_VALUE = createError<[flag: string]>(
  'Missing value for option "%s"',
  'E_MISSING_FLAG_VALUE'
)

/**
 * Missing a required argument when running the command
 */
export const E_MISSING_ARG = createError<[arg: string]>(
  'Missing required argument "%s"',
  'E_MISSING_ARG'
)

/**
 * Missing value for an argument
 */
export const E_MISSING_ARG_VALUE = createError<[arg: string]>(
  'Missing value for argument "%s"',
  'E_MISSING_ARG_VALUE'
)

/**
 * An unknown flag was mentioned
 */
export const E_UNKNOWN_FLAG = createError<[flag: string]>(
  'Unknown flag "%s". The mentioned flag is not accepted by the command',
  'E_UNKNOWN_FLAG'
)

/**
 * Invalid value provided for the flag
 */
export const E_INVALID_FLAG = createError<[flag: string, expectedDataType: string]>(
  'Invalid value. The "%s" flag accepts a "%s" value',
  'E_INVALID_FLAG'
)
