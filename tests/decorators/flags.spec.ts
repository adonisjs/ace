/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { BaseCommand } from '../../src/commands/base.js'
import { flags } from '../../src/decorators/flags.js'

test.group('Base command | flags', () => {
  test('define flags using decorators', ({ assert }) => {
    class MakeModel extends BaseCommand {
      @flags.string()
      connection?: string

      @flags.boolean()
      dropAll?: boolean

      @flags.number()
      batchSize?: number

      @flags.array()
      files?: string[]
    }

    assert.deepEqual(MakeModel.getParserOptions().flagsParserOptions, {
      all: ['connection', 'drop-all', 'batch-size', 'files'],
      string: ['connection'],
      boolean: ['drop-all'],
      array: ['files'],
      number: ['batch-size'],
      alias: {},
      count: [],
      coerce: {},
      default: {},
    })
  })
})
