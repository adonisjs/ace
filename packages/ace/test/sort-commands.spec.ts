/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import { sortAndGroupCommands } from '../src/utils/sortAndGroupCommands'
import { BaseCommand } from '../src/BaseCommand'

test.group('utils | sortAndGroupCommands', () => {
  test('sort commands in alphabetical order', (assert) => {
    class Greet extends BaseCommand {
      public static commandName = 'greet'
    }

    class Run extends BaseCommand {
      public static commandName = 'run'
    }

    const output = sortAndGroupCommands([Run, Greet])
    assert.deepEqual(output, [{ group: 'root', commands: [Greet, Run] }])
  })

  test('sort and group commands in alphabetical order', (assert) => {
    class MakeController extends BaseCommand {
      public static commandName = 'make:controller'
    }

    class MakeModel extends BaseCommand {
      public static commandName = 'make:model'
    }

    class Run extends BaseCommand {
      public static commandName = 'run'
    }

    const output = sortAndGroupCommands([MakeController, MakeModel, Run])
    assert.deepEqual(output, [
      { group: 'root', commands: [Run] },
      { group: 'make', commands: [MakeController, MakeModel] },
    ])
  })

  test('sort groups in alphabetical order too', (assert) => {
    class MakeController extends BaseCommand {
      public static commandName = 'make:controller'
    }

    class MakeModel extends BaseCommand {
      public static commandName = 'make:model'
    }

    class AuthScaffold extends BaseCommand {
      public static commandName = 'auth:scaffold'
    }

    class Run extends BaseCommand {
      public static commandName = 'run'
    }

    const output = sortAndGroupCommands([MakeController, MakeModel, Run, AuthScaffold])
    assert.deepEqual(output, [
      { group: 'root', commands: [Run] },
      { group: 'auth', commands: [AuthScaffold] },
      { group: 'make', commands: [MakeController, MakeModel] },
    ])
  })
})
