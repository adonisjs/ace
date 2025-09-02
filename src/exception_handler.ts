/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { errors as promptsErrors } from '@poppinss/prompts'
import { errors, type Kernel } from '../index.ts'
import { renderErrorWithSuggestions } from './utils.ts'

/**
 * The base exception handler that is used by default to handle
 * Ace exceptions.
 *
 * You can extend this class to customize the exception rendering
 * behavior.
 *
 * @example
 * ```ts
 * export class MyExceptionHandler extends ExceptionHandler {
 *   async render(error: unknown, kernel: Kernel<any>) {
 *     // Custom error handling
 *     await super.render(error, kernel)
 *   }
 * }
 * ```
 */
export class ExceptionHandler {
  /**
   * Enable debug mode for detailed error reporting
   */
  debug: boolean = true

  /**
   * Known error codes. For these errors, only the error message is
   * reported using the logger
   */
  protected knownErrorCodes: string[] = []

  /**
   * Internal set of known error codes
   */
  protected internalKnownErrorCode = Object.keys(errors)

  /**
   * Logs error to stderr using logger
   *
   * @param error - The error object with a message property
   * @param kernel - The Ace kernel instance
   */
  protected logError(error: { message: any } & unknown, kernel: Kernel<any>) {
    kernel.ui.logger.logError(`${kernel.ui.colors.bgRed().white('  ERROR  ')} ${error.message}`)
  }

  /**
   * Pretty prints uncaught error in debug mode using Youch
   *
   * @param error - The error object to pretty print
   */
  protected async prettyPrintError(error: object) {
    const { Youch } = await import('youch')

    const youch = new Youch()
    console.log(await youch.toANSI(error))
  }

  /**
   * Renders an exception for the console with appropriate formatting
   *
   * @param error - The error to render
   * @param kernel - The Ace kernel instance
   *
   * @example
   * ```ts
   * const handler = new ExceptionHandler()
   * await handler.render(new Error('Something went wrong'), kernel)
   * ```
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
     * Display prompt cancellation error
     */
    if (error instanceof promptsErrors.E_PROMPT_CANCELLED) {
      this.logError({ message: 'Prompt cancelled' }, kernel)
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
     * Allow errors to be self handled.
     */
    if ('render' in error && typeof error.render === 'function') {
      return error.render(error, kernel)
    }

    /**
     * Log error message and stack only when not in debug mode
     */
    if (!this.debug) {
      kernel.ui.logger.fatal(error as any)
      return
    }

    return this.prettyPrintError(error)
  }
}
