/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { errors, Kernel } from '../index.js'
import { renderErrorWithSuggestions } from './helpers.js'

/**
 * The base exception handler that is used by default to exception
 * ace exceptions.
 *
 * You can extend this class to custom the exception rendering
 * behavior.
 */
export class ExceptionHandler {
  debug: boolean = true

  /**
   * Known error codes. For these error, only the error message is
   * reported using the logger
   */
  protected knownErrorCodes: string[] = []

  /**
   * Internal set of known error codes.
   */
  protected internalKnownErrorCode = Object.keys(errors)

  /**
   * Logs error to stderr using logger
   */
  protected logError(error: { message: any } & unknown, kernel: Kernel<any>) {
    kernel.ui.logger.logError(`${kernel.ui.colors.bgRed().white('  ERROR  ')} ${error.message}`)
  }

  /**
   * Pretty prints uncaught error in debug mode
   */
  protected async prettyPrintError(error: object) {
    // @ts-expect-error
    const { default: youchTerminal } = await import('youch-terminal')
    const { default: Youch } = await import('youch')

    const youch = new Youch(error, {})
    console.log(youchTerminal(await youch.toJSON(), { displayShortPath: true }))
  }

  /**
   * Renders an exception for the console
   */
  async render(error: unknown, kernel: Kernel<any>) {
    /**
     * Render non object errors or errors without message property
     * as a string using the logger
     */
    if (typeof error !== 'object' || error === null || !('message' in error)) {
      this.logError({ message: String(error) }, kernel)
      return
    }

    /**
     * Report command not found error with command suggestions
     */
    if (error instanceof errors.E_COMMAND_NOT_FOUND) {
      renderErrorWithSuggestions(
        kernel.ui,
        error.message,
        kernel.getCommandSuggestions(error.commandName)
      )
      return
    }

    /**
     * Known errors should always be reported with a message
     */
    if (
      'code' in error &&
      typeof error.code === 'string' &&
      (this.internalKnownErrorCode.includes(error.code) ||
        this.knownErrorCodes.includes(error.code))
    ) {
      this.logError({ message: error.message }, kernel)
      return
    }

    /**
     * Log error message only when not in debug mode
     */
    if (!this.debug) {
      this.logError({ message: error.message }, kernel)
      return
    }

    return this.prettyPrintError(error)
  }
}
