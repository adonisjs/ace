/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Validator } from 'jsonschema'
import { readFile } from 'node:fs/promises'
import { RuntimeException } from '@poppinss/utils'

import { schemaRoot } from '../schemas/main.js'
import type { AbstractBaseCommand, CommandMetaData, UIPrimitives } from './types.js'

const schema = JSON.parse(
  await readFile(new URL('./command_metadata_schema.json', schemaRoot), 'utf8')
)

/**
 * Helper to sort array of strings alphabetically.
 */
export function sortAlphabetically(prev: string, curr: string) {
  if (curr > prev) {
    return -1
  }

  if (curr < prev) {
    return 1
  }

  return 0
}

/**
 * Renders an error message and lists suggestions.
 */
export function renderErrorWithSuggestions(
  ui: UIPrimitives,
  message: string,
  suggestions: string[]
) {
  const instructions = ui
    .sticker()
    .fullScreen()
    .drawBorder((borderChar, colors) => colors.red(borderChar))

  instructions.add(ui.colors.red(message))
  if (suggestions.length) {
    instructions.add('')
    instructions.add(`${ui.colors.dim('Did you mean?')} ${suggestions.slice(0, 4).join(', ')}`)
  }

  instructions.getRenderer().logError(instructions.prepare())
}

/**
 * Validates the metadata of a command to ensure it has all the neccessary
 * properties
 */
export function validateCommandMetaData(
  command: unknown,
  exportPath: string
): asserts command is CommandMetaData {
  if (!command || typeof command !== 'object') {
    throw new RuntimeException(`Invalid command metadata exported from ${exportPath}`)
  }

  try {
    new Validator().validate(command, schema, { throwError: true })
  } catch (error) {
    throw new RuntimeException(`Invalid command exported from ${exportPath}. ${error.message}`)
  }
}

/**
 * Validates the command class. We do not check it against the "BaseCommand"
 * class, because the ace version mis-match could make the validation
 * fail.
 */
export function validateCommand<Command extends AbstractBaseCommand>(
  command: unknown,
  exportPath: string
): asserts command is Command {
  if (typeof command !== 'function' || !command.toString().startsWith('class ')) {
    throw new RuntimeException(
      `Invalid command exported from ${exportPath}. Expected command to be a class`
    )
  }

  const commandConstructor = command as Function & { serialize: () => unknown }
  if (typeof commandConstructor.serialize !== 'function') {
    throw new RuntimeException(
      `Invalid command exported from ${exportPath}. Expected command to extend the "BaseCommand"`
    )
  }

  validateCommandMetaData(commandConstructor.serialize(), exportPath)
}
