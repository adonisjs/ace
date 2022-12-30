/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { ListFormatter } from '../../src/formatters/list.js'

test.group('Formatters | list', () => {
  test('justify option column in all tables', ({ assert }) => {
    const formatter = new ListFormatter([
      {
        columns: [
          {
            option: '  make:controller  ',
            description: 'Make a new HTTP controller',
          },
          {
            option: '  make:model  ',
            description: 'Make a new model',
          },
        ],
        heading: 'Commands',
      },
      {
        columns: [
          {
            option: '  --env  ',
            description: 'Set env for command',
          },
          {
            option: '  --help  ',
            description: 'View help for a command',
          },
        ],
        heading: 'Options',
      },
    ])

    assert.deepEqual(formatter.format(80), [
      {
        heading: 'Commands',
        rows: [
          '  make:controller  Make a new HTTP controller',
          '  make:model       Make a new model',
        ],
      },
      {
        rows: [
          '  --env            Set env for command',
          '  --help           View help for a command',
        ],
        heading: 'Options',
      },
    ])
  })

  test('wrap descriptions to newline', ({ assert }) => {
    const formatter = new ListFormatter([
      {
        columns: [
          {
            option: '  serve  ',
            description:
              'Start the AdonisJS HTTP server, along with the file watcher. Also starts the webpack dev server when webpack encore is installed',
          },
          {
            option: '  make:controller  ',
            description: 'Make a new HTTP controller',
          },
          {
            option: '  make:model  ',
            description: 'Make a new model',
          },
        ],
        heading: 'Commands',
      },
      {
        columns: [
          {
            option: '  --env  ',
            description: 'Set env for command',
          },
          {
            option: '  --help  ',
            description: 'View help for a command',
          },
        ],
        heading: 'Options',
      },
    ])

    assert.deepEqual(formatter.format(80), [
      {
        heading: 'Commands',
        rows: [
          [
            '  serve            Start the AdonisJS HTTP server, along with the file watcher.',
            '                   Also starts the webpack dev server when webpack encore is',
            '                   installed',
          ].join('\n'),
          '  make:controller  Make a new HTTP controller',
          '  make:model       Make a new model',
        ],
      },
      {
        rows: [
          '  --env            Set env for command',
          '  --help           View help for a command',
        ],
        heading: 'Options',
      },
    ])
  })
})
