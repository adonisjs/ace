/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createError, Exception } from '@poppinss/utils'

/**
 * Cannot define required argument after an optional argument
 */
export const E_CANNOT_DEFINE_REQUIRED_ARG = createError<[arg: string, optionalArg: string]>(
  'Cannot define required argument "%s" after optional argument "%s"',
  'E_CANNOT_DEFINE_REQUIRED_ARG'
)

/**
 * Cannot define another argument after a spread argument
 */
export const E_CANNOT_DEFINE_ARG = createError<[arg: string, spreadArg: string]>(
  'Cannot define argument "%s" after spread argument "%s". Spread argument should be the last one',
  'E_CANNOT_DEFINE_ARG'
)

/**
 * Cannot define a flag because it is missing the flag type
 */
export const E_MISSING_FLAG_TYPE = createError<[flag: string]>(
  'Cannot define flag "%s". Specify the flag type',
  'E_MISSING_FLAG_TYPE'
)

/**
 * Command is missing the static property command name
 */
export const E_MISSING_COMMAND_NAME = createError<[command: string]>(
  'Cannot serialize command "%s". Missing static property "commandName"',
  'E_MISSING_COMMAND_NAME'
)

/**
 * Cannot define an argument because it is missing the arg type
 */
export const E_MISSING_ARG_TYPE = createError<[arg: string]>(
  'Cannot define argument "%s". Specify the argument type',
  'E_MISSING_ARG_TYPE'
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
