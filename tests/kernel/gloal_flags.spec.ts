/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Kernel } from '../../src/kernel.js'

test.group('Kernel | global flags', () => {
  test('define global flags', async ({ assert }) => {
    const kernel = new Kernel()
    const kernel1 = new Kernel()

    kernel.defineFlag('help', { type: 'boolean' })
    kernel1.defineFlag('version', { type: 'boolean' })

    assert.deepEqual(kernel.flags, [
      {
        flagName: 'help',
        name: 'help',
        type: 'boolean',
        required: false,
      },
    ])
    assert.deepEqual(kernel1.flags, [
      {
        flagName: 'version',
        name: 'version',
        type: 'boolean',
        required: false,
      },
    ])
  })

  test('disallow registering global flags after kernel is booted', async ({ assert }) => {
    const kernel = new Kernel()
    await kernel.boot()

    assert.throws(
      () => kernel.defineFlag('help', { type: 'boolean' }),
      'Cannot register global flag in "booted" state'
    )
  })
})
