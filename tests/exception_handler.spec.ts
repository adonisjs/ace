/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Exception } from '@poppinss/utils'
import { errors, Kernel } from '../index.js'
import { ExceptionHandler } from '../src/exception_handler.js'

test.group('Exception handler', () => {
  test('render non object exceptions using the logger', async ({ assert }) => {
    const kernel = Kernel.create()
    kernel.ui.switchMode('raw')

    class CustomExceptionHandler extends ExceptionHandler {
      debug: boolean = true
      protected knownErrorCodes: string[] = ['E_CUSTOM_CODE']
    }

    await new CustomExceptionHandler().render('foo', kernel)

    const logs = kernel.ui.logger.getLogs()
    assert.lengthOf(logs, 1)
    assert.equal(logs[0].stream, 'stderr')
    assert.equal(logs[0].message, 'bgRed(white(  ERROR  )) foo')
  })

  test('render null values using the logger', async ({ assert }) => {
    const kernel = Kernel.create()
    kernel.ui.switchMode('raw')

    class CustomExceptionHandler extends ExceptionHandler {
      debug: boolean = true
      protected knownErrorCodes: string[] = ['E_CUSTOM_CODE']
    }

    await new CustomExceptionHandler().render(null, kernel)

    const logs = kernel.ui.logger.getLogs()
    assert.lengthOf(logs, 1)
    assert.equal(logs[0].stream, 'stderr')
    assert.equal(logs[0].message, 'bgRed(white(  ERROR  )) null')
  })

  test('report internal known exceptions using the logger', async ({ assert }) => {
    const kernel = Kernel.create()
    kernel.ui.switchMode('raw')

    class CustomExceptionHandler extends ExceptionHandler {
      debug: boolean = true
      protected knownErrorCodes: string[] = ['E_CUSTOM_CODE']
    }

    await new CustomExceptionHandler().render(new errors.E_MISSING_ARG(['name']), kernel)

    const logs = kernel.ui.logger.getLogs()
    assert.lengthOf(logs, 1)
    assert.equal(logs[0].stream, 'stderr')
    assert.equal(logs[0].message, 'bgRed(white(  ERROR  )) Missing required argument "name"')
  })

  test('report known exceptions using the logger', async ({ assert }) => {
    const kernel = Kernel.create()
    kernel.ui.switchMode('raw')

    class CustomExceptionHandler extends ExceptionHandler {
      protected knownErrorCodes: string[] = ['E_CUSTOM_CODE']
    }

    const error = new Exception('Custom error', { code: 'E_CUSTOM_CODE' })
    await new CustomExceptionHandler().render(error, kernel)

    const logs = kernel.ui.logger.getLogs()
    assert.lengthOf(logs, 1)
    assert.equal(logs[0].stream, 'stderr')
    assert.equal(logs[0].message, 'bgRed(white(  ERROR  )) Custom error')
  })

  test('pretty print uncaught exceptions using youch', async ({ assert }) => {
    const kernel = Kernel.create()
    kernel.ui.switchMode('raw')

    class CustomExceptionHandler extends ExceptionHandler {
      debug: boolean = true
      protected knownErrorCodes: string[] = ['E_CUSTOM_CODE']

      protected async prettyPrintError(error: any) {
        kernel.ui.logger.logError(`Pretty printing: ${error.message}`)
      }
    }

    await new CustomExceptionHandler().render(new Error('Something went wrong'), kernel)

    const logs = kernel.ui.logger.getLogs()
    assert.lengthOf(logs, 1)
    assert.equal(logs[0].stream, 'stderr')
    assert.equal(logs[0].message, 'Pretty printing: Something went wrong')
  })

  test('do not pretty print when not in debug mode', async ({ assert }) => {
    const kernel = Kernel.create()
    kernel.ui.switchMode('raw')

    class CustomExceptionHandler extends ExceptionHandler {
      debug: boolean = false
      protected knownErrorCodes: string[] = ['E_CUSTOM_CODE']

      protected async prettyPrintError(error: any) {
        kernel.ui.logger.logError(`Pretty printing: ${error.message}`)
      }
    }

    await new CustomExceptionHandler().render(new Error('Something went wrong'), kernel)

    const logs = kernel.ui.logger.getLogs()
    assert.lengthOf(logs, 1)
    assert.equal(logs[0].stream, 'stderr')
    assert.equal(logs[0].message, 'bgRed(white(  ERROR  )) Something went wrong')
  })
})
