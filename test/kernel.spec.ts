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
import { args } from '../src/Decorators/args'
import { flags } from '../src/Decorators/flags'

test.group('Kernel | register', () => {
  test('raise error when required argument comes after optional argument', (assert) => {
    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string({ required: false })
      public name: string

      @args.string()
      public age: string
    }

    const kernel = new Kernel()
    const fn = () => kernel.register([Greet])
    assert.throw(fn, 'optional argument {name} must be after required argument {age}')
  })

  test('raise error when command name is missing', (assert) => {
    class Greet extends BaseCommand {
    }

    const kernel = new Kernel()
    const fn = () => kernel.register([Greet])
    assert.throw(fn, 'missing command name for {Greet} class')
  })

  test('raise error when spread argument isn\'t the last one', (assert) => {
    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.spread()
      public files: string[]

      @args.string()
      public name: string
    }

    const kernel = new Kernel()
    const fn = () => kernel.register([Greet])
    assert.throw(fn, 'spread argument {files} must be at last position')
  })

  test('return command suggestions for a given string', (assert) => {
    const kernel = new Kernel()

    class Install extends BaseCommand {
      public static commandName = 'install'
    }

    class Greet extends BaseCommand {
      public static commandName = 'greet'
    }

    kernel.register([Install, Greet])
    assert.deepEqual(kernel.getSuggestions('itall'), ['install'])
  })
})

test.group('Kernel | find', () => {
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
})

test.group('Kernel | handle', () => {
  test('raise exception when required argument is missing', async (assert) => {
    assert.plan(1)

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string()
      public name: string
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet']
    try {
      await kernel.handle(argv)
    } catch ({ message }) {
      assert.equal(message, 'missing required argument {name}')
    }
  })

  test('work fine when argument is missing and is optional', async (assert) => {
    assert.plan(1)

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string({ required: false })
      public name: string

      public async handle () {
        assert.deepEqual(this.parsed, { _: [] })
      }
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet']
    await kernel.handle(argv)
  })

  test('work fine when required argument is defined', async (assert) => {
    assert.plan(2)

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string()
      public name: string

      public async handle () {
        assert.deepEqual(this.parsed, { _: ['virk'] })
        assert.equal(this.name, 'virk')
      }
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk']
    await kernel.handle(argv)
  })

  test('define spread arguments', async (assert) => {
    assert.plan(2)

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.spread()
      public files: string[]

      public async handle () {
        assert.deepEqual(this.parsed, { _: ['foo.js', 'bar.js'] })
        assert.deepEqual(this.files, ['foo.js', 'bar.js'])
      }
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'foo.js', 'bar.js']
    await kernel.handle(argv)
  })

  test('define spread arguments with regular arguments', async (assert) => {
    assert.plan(4)

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string()
      public name: string

      @args.string()
      public age: string

      @args.spread()
      public files: string[]

      public async handle () {
        assert.deepEqual(this.parsed, { _: ['virk', '22', 'foo.js', 'bar.js'] })
        assert.equal(this.name, 'virk')
        assert.equal(this.age, '22')
        assert.deepEqual(this.files, ['foo.js', 'bar.js'])
      }
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk', '22', 'foo.js', 'bar.js']
    await kernel.handle(argv)
  })

  test('set arguments and flags', async (assert) => {
    assert.plan(3)

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string()
      public name: string

      @flags.boolean()
      public admin: boolean

      public async handle () {
        assert.deepEqual(this.parsed, { _: ['virk'], admin: true })
        assert.equal(this.name, 'virk')
        assert.isTrue(this.admin)
      }
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk', '--admin']
    await kernel.handle(argv)
  })

  test('set arguments and flags when flag is defined with = sign', async (assert) => {
    assert.plan(3)

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string()
      public name: string

      @flags.boolean()
      public admin: boolean

      public async handle () {
        assert.deepEqual(this.parsed, { _: ['virk'], admin: true })
        assert.equal(this.name, 'virk')
        assert.isTrue(this.admin)
      }
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk', '--admin=true']
    await kernel.handle(argv)
  })

  test('set arguments and flags when flag alias is passed', async (assert) => {
    assert.plan(3)

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string()
      public name: string

      @flags.boolean({ alias: 'a' })
      public admin: boolean

      public async handle () {
        assert.deepEqual(this.parsed, { _: ['virk'], admin: true, a: true })
        assert.equal(this.name, 'virk')
        assert.isTrue(this.admin)
      }
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk', '-a']
    await kernel.handle(argv)
  })

  test('parse boolean flags as boolean always', async (assert) => {
    assert.plan(3)

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string()
      public name: string

      @flags.boolean()
      public admin: boolean

      public async handle () {
        assert.deepEqual(this.parsed, { _: ['virk'], admin: true })
        assert.equal(this.name, 'virk')
        assert.isTrue(this.admin)
      }
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk', '--admin=true']
    await kernel.handle(argv)
  })

  test('parse boolean flags as boolean always also when aliases are defined', async (assert) => {
    assert.plan(3)

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string()
      public name: string

      @flags.boolean({ alias: 'a' })
      public admin: boolean

      public async handle () {
        assert.deepEqual(this.parsed, { _: ['virk'], admin: true, a: true })
        assert.equal(this.name, 'virk')
        assert.isTrue(this.admin)
      }
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk', '-a=true']
    await kernel.handle(argv)
  })

  test('do not override default value when flag is not defined', async (assert) => {
    assert.plan(3)

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string()
      public name: string

      @flags.boolean({ default: true, alias: 'a' })
      public admin: boolean

      public async handle () {
        assert.deepEqual(this.parsed, { _: ['virk'], admin: true, a: true })
        assert.equal(this.name, 'virk')
        assert.isTrue(this.admin)
      }
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk']
    await kernel.handle(argv)
  })

  test('parse flags as array when type is set to array', async (assert) => {
    assert.plan(3)

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string()
      public name: string

      @flags.array()
      public files: string[]

      public async handle () {
        assert.deepEqual(this.parsed, { _: ['virk'], files: ['foo.js'] })
        assert.equal(this.name, 'virk')
        assert.deepEqual(this.files, ['foo.js'])
      }
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk', '--files=foo.js']
    await kernel.handle(argv)
  })

  test('register global flags', async (assert) => {
    assert.plan(2)

    const kernel = new Kernel()
    kernel.flag('env', (env, parsed) => {
      assert.equal(env, 'production')
      assert.deepEqual(parsed, { _: [], env: 'production' })
    }, { type: 'string' })

    const argv = ['--env=production']
    await kernel.handle(argv)
  })

  test('register global boolean flags', async (assert) => {
    assert.plan(2)

    const kernel = new Kernel()
    kernel.flag('ansi', (ansi, parsed) => {
      assert.equal(ansi, true)
      assert.deepEqual(parsed, { _: [], ansi: true })
    }, {})

    const argv = ['--ansi']
    await kernel.handle(argv)
  })

  test('register global reverse boolean flags', async (assert) => {
    assert.plan(2)

    const kernel = new Kernel()
    kernel.flag('ansi', (ansi, parsed) => {
      assert.equal(ansi, false)
      assert.deepEqual(parsed, { _: [], ansi: false })
    }, {})

    const argv = ['--no-ansi']
    await kernel.handle(argv)
  })

  test('do not execute string global flag when flag is not defined', async () => {
    const kernel = new Kernel()
    kernel.flag('env', () => {
      throw new Error('Not expected to be called')
    }, { type: 'string' })

    const argv = ['--ansi']
    await kernel.handle(argv)
  })

  test('do not execute array global flag when flag is not defined', async () => {
    const kernel = new Kernel()
    kernel.flag('env', () => {
      throw new Error('Not expected to be called')
    }, { type: 'array' })

    const argv = ['--ansi']
    await kernel.handle(argv)
  })

  test('do not execute num array type global flag when flag is not defined', async () => {
    const kernel = new Kernel()
    kernel.flag('env', () => {
      throw new Error('Not expected to be called')
    }, { type: 'numArray' })

    const argv = ['--ansi']
    await kernel.handle(argv)
  })

  test('pass command instance to the global flag, when flag is defined on a command', async (assert) => {
    assert.plan(3)
    const kernel = new Kernel()

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string()
      public name: string

      public async handle () {
      }
    }

    kernel.register([Greet])

    kernel.flag('env', (env, parsed, command) => {
      assert.equal(env, 'production')
      assert.deepEqual(parsed, { _: ['virk'], env: 'production' })
      assert.deepEqual(command, Greet)
    }, { type: 'string' })

    const argv = ['greet', 'virk', '--env=production']
    await kernel.handle(argv)
  })
})
