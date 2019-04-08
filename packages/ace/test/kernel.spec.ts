/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import { Kernel } from '../src/Kernel'
import { BaseCommand } from '../src/BaseCommand'

test.group('Kernel', () => {
  test('find relevant command from the commands list', (assert) => {
    class Greet extends BaseCommand {
      public static commandName = 'greet'
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    assert.deepEqual(kernel.find(['greet']), Greet)
  })

  test('return null when unable to find command', (assert) => {
    const kernel = new Kernel()
    assert.isNull(kernel.find(['greet']))
  })

  test('raise exception when required argument is missing', (assert) => {
    class Greet extends BaseCommand {
      public static commandName = 'greet'

      public static args = [
        {
          name: 'name',
          required: true,
        },
      ]
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet']
    const command = kernel.find(argv)
    const fn = () => kernel.make(command!, argv)

    assert.throw(fn, 'Missing value for name argument')
  })

  test('work fine when argument is missing and is optional', (assert) => {
    class Greet extends BaseCommand {
      public static commandName = 'greet'

      public static args = [
        {
          name: 'name',
          required: false,
        },
      ]
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet']
    const command = kernel.find(argv)

    assert.instanceOf(kernel.make(command!, argv), Greet)
  })

  test('work fine when argument is defined', (assert) => {
    class Greet extends BaseCommand {
      public static commandName = 'greet'

      public static args = [
        {
          name: 'name',
          required: true,
        },
      ]

      public name: string
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk']
    const command = kernel.make(kernel.find(argv)!, argv)
    assert.equal(command['name'], 'virk')
  })

  test('set arguments and flags', (assert) => {
    class Greet extends BaseCommand {
      public static commandName = 'greet'

      public static args = [
        {
          name: 'name',
          required: true,
        },
      ]

      public static flags = [
        {
          name: 'admin',
          type: 'boolean' as 'boolean',
        },
      ]

      public name: string
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk', '--admin']
    const command = kernel.make(kernel.find(argv)!, argv)
    assert.equal(command['name'], 'virk')
    assert.equal(command['admin'], true)
  })

  test('set arguments and flags when flag is defined with = sign', (assert) => {
    class Greet extends BaseCommand {
      public static commandName = 'greet'

      public static args = [
        {
          name: 'name',
          required: true,
        },
      ]

      public static flags = [
        {
          name: 'admin',
          type: 'boolean' as 'boolean',
        },
      ]

      public name: string
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk', '--admin=true']
    const command = kernel.make(kernel.find(argv)!, argv)
    assert.equal(command['name'], 'virk')
    assert.equal(command['admin'], true)
  })

  test('set arguments and flags when flag alias is passed', (assert) => {
    class Greet extends BaseCommand {
      public static commandName = 'greet'

      public static args = [
        {
          name: 'name',
          required: true,
        },
      ]

      public static flags = [
        {
          name: 'admin',
          alias: 'a',
          type: 'boolean' as 'boolean',
        },
      ]

      public name: string
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk', '-a']
    const command = kernel.make(kernel.find(argv)!, argv)
    assert.equal(command['name'], 'virk')
    assert.equal(command['admin'], true)
  })

  test('parse boolean flags as boolean always', (assert) => {
    class Greet extends BaseCommand {
      public static commandName = 'greet'

      public static args = [
        {
          name: 'name',
          required: true,
        },
      ]

      public static flags = [
        {
          name: 'admin',
          type: 'boolean' as 'boolean',
        },
      ]

      public name: string
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk', '--admin=true']
    const command = kernel.make(kernel.find(argv)!, argv)
    assert.equal(command['name'], 'virk')
    assert.equal(command['admin'], true)
  })

  test('parse boolean flags as boolean always also when aliases are defined', (assert) => {
    class Greet extends BaseCommand {
      public static commandName = 'greet'

      public static args = [
        {
          name: 'name',
          required: true,
        },
      ]

      public static flags = [
        {
          name: 'admin',
          alias: 'a',
          type: 'boolean' as 'boolean',
        },
      ]

      public name: string
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk', '-a=true']
    const command = kernel.make(kernel.find(argv)!, argv)
    assert.equal(command['name'], 'virk')
    assert.equal(command['admin'], true)
  })

  test('do not override default value when flag is not defined', (assert) => {
    class Greet extends BaseCommand {
      public static commandName = 'greet'

      public static args = [
        {
          name: 'name',
          required: true,
        },
      ]

      public static flags = [
        {
          name: 'admin',
          alias: 'a',
          default: true,
          type: 'boolean' as 'boolean',
        },
      ]

      public name: string
      public admin: boolean
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk']
    const command = kernel.make(kernel.find(argv)!, argv)
    assert.equal(command['name'], 'virk')
    assert.equal(command['admin'], true)
  })

  test('pass parsed output to the command', (assert) => {
    class Greet extends BaseCommand {
      public static commandName = 'greet'

      public static args = [
        {
          name: 'name',
          required: true,
        },
      ]

      public static flags = [
        {
          name: 'admin',
          alias: 'a',
          default: true,
          type: 'boolean' as 'boolean',
        },
      ]

      public name: string
      public admin: boolean
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk', '-a=true']
    const command = kernel.make(kernel.find(argv)!, argv)
    assert.deepEqual(command['parsed'], {
      _: ['virk'],
      a: true,
      admin: true,
    })
  })
})
