/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { UIPrimitives } from './types.js'

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
