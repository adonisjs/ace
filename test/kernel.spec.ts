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
import { Manifest } from '../src/Manifest'
import { Filesystem } from '@adonisjs/dev-utils'
import { join } from 'path'

const fs = new Filesystem(join(__dirname, '__app'))

test.group('Kernel | register', () => {
  test('raise error when required argument comes after optional argument', (assert) => {
    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string({ required: false })
      public name: string

      @args.string()
      public age: string

      public async handle () {}
    }

    const kernel = new Kernel()
    const fn = () => kernel.register([Greet])
    assert.throw(fn, 'optional argument {name} must be after required argument {age}')
  })

  test('raise error when command name is missing', (assert) => {
    class Greet extends BaseCommand {
      public async handle () {}
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

      public async handle () {}
    }

    const kernel = new Kernel()
    const fn = () => kernel.register([Greet])
    assert.throw(fn, 'spread argument {files} must be at last position')
  })

  test('register command', (assert) => {
    const kernel = new Kernel()

    class Install extends BaseCommand {
      public static commandName = 'install'
      public async handle () {}
    }

    class Greet extends BaseCommand {
      public static commandName = 'greet'
      public async handle () {}
    }

    kernel.register([Install, Greet])
    assert.deepEqual(kernel.commands, { install: Install, greet: Greet })
  })

  test('return command name suggestions for a given string', (assert) => {
    const kernel = new Kernel()

    class Install extends BaseCommand {
      public static commandName = 'install'
      public async handle () {}
    }

    class Greet extends BaseCommand {
      public static commandName = 'greet'
      public async handle () {}
    }

    kernel.register([Install, Greet])
    assert.deepEqual(kernel.getSuggestions('itall'), ['install'])
  })
})

test.group('Kernel | find', () => {
  test('find relevant command from the commands list', (assert) => {
    class Greet extends BaseCommand {
      public static commandName = 'greet'
      public async handle () {}
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    assert.deepEqual(kernel.find(['greet']), Greet)
  })

  test('return null when unable to find command', (assert) => {
    const kernel = new Kernel()
    assert.isNull(kernel.find(['greet']))
  })

  test('find command from manifest when manifestCommands exists', async (assert) => {
    const kernel = new Kernel()
    const manifest = new Manifest(fs.basePath)

    await fs.add(`ace-manifest.json`, JSON.stringify({
      greet: {
        commandName: 'greet',
        commandPath: 'Commands/Greet.ts',
      },
    }))

    await fs.add('Commands/Greet.ts', `export default class Greet {
      public static commandName = 'greet'
    }`)

    kernel.useManifest(manifest)
    kernel.manifestCommands = await manifest.load()

    const greet = kernel.find(['greet'])
    assert.equal(greet!.name, 'Greet')

    await fs.cleanup()
  })
})

test.group('Kernel | handle', () => {
  test('raise exception when required argument is missing', async (assert) => {
    assert.plan(3)

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string()
      public name: string

      public async handle () {}
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet']
    try {
      await kernel.handle(argv)
    } catch ({ message, argumentName, command }) {
      assert.equal(message, 'E_MISSING_ARGUMENT: missing required argument name')
      assert.equal(argumentName, 'name')
      assert.deepEqual(command, Greet)
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

  test('define arg name different from property name', async (assert) => {
    assert.plan(2)

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string({ name: 'theName' })
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

  test('define flag name different from property name', async (assert) => {
    assert.plan(2)

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @flags.boolean({ name: 'isAdmin' })
      public admin: boolean

      public async handle () {
        assert.deepEqual(this.parsed, { _: [], isAdmin: true })
        assert.isTrue(this.admin)
      }
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', '--isAdmin']
    await kernel.handle(argv)
  })
})

test.group('Kernel | runCommand', () => {
  test('test logs in raw mode', async (assert) => {
    assert.plan(1)

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string()
      public name: string

      public async handle () {
        this.$log(`Hello ${this.colors.cyan(this.name)}`)
      }
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk']
    const command = kernel.find(argv)!
    const commandInstance = new command(true)
    await kernel.runCommand(argv, commandInstance)

    assert.deepEqual(commandInstance.logs, ['Hello cyan(virk)'])
  })

  test('test input prompt in raw mode', async (assert) => {
    assert.plan(1)

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string()
      public name: string

      public async handle () {
        const username = await this.prompt.ask('What\'s your username?', {
          name: 'username',
        })

        this.$log(username)
      }
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk']
    const command = kernel.find(argv)!
    const commandInstance = new command(true)

    /**
     * Responding to prompt programatically
     */
    commandInstance.prompt.on('prompt', (prompt) => {
      prompt.answer('virk')
    })

    await kernel.runCommand(argv, commandInstance)
    assert.deepEqual(commandInstance.logs, ['virk'])
  })

  test('test input prompt validation in raw mode', async (assert) => {
    assert.plan(2)

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string()
      public name: string

      public async handle () {
        const username = await this.prompt.ask('What\'s your username?', {
          name: 'username',
          validate (value) {
            return !!value
          },
        })

        this.$log(username)
      }
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk']
    const command = kernel.find(argv)!
    const commandInstance = new command(true)

    /**
     * Responding to prompt programatically
     */
    commandInstance.prompt.on('prompt', (prompt) => {
      prompt.answer('')
    })

    commandInstance.prompt.on('prompt:error', (message) => {
      assert.equal(message, 'Enter the value')
    })

    await kernel.runCommand(argv, commandInstance)
    assert.deepEqual(commandInstance.logs, [''])
  })

  test('test choice prompt in raw mode', async (assert) => {
    assert.plan(1)

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string()
      public name: string

      public async handle () {
        const client = await this.prompt.choice('Select the installation client', ['npm', 'yarn'])
        this.$log(client)
      }
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk']
    const command = kernel.find(argv)!
    const commandInstance = new command(true)

    /**
     * Responding to prompt programatically
     */
    commandInstance.prompt.on('prompt', (prompt) => {
      prompt.select(0)
    })

    await kernel.runCommand(argv, commandInstance)
    assert.deepEqual(commandInstance.logs, ['npm'])
  })

  test('test choice prompt validation in raw mode', async (assert) => {
    assert.plan(2)

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string()
      public name: string

      public async handle () {
        const client = await this.prompt.choice('Select the installation client', ['npm', 'yarn'], {
          validate (answer) {
            return !!answer
          },
        })
        this.$log(client)
      }
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk']
    const command = kernel.find(argv)!
    const commandInstance = new command(true)

    /**
     * Responding to prompt programatically
     */
    commandInstance.prompt.on('prompt', (prompt) => {
      prompt.answer('')
    })

    commandInstance.prompt.on('prompt:error', (message) => {
      assert.equal(message, 'Enter the value')
    })

    await kernel.runCommand(argv, commandInstance)
    assert.deepEqual(commandInstance.logs, [''])
  })

  test('test multiple prompt in raw mode', async (assert) => {
    assert.plan(1)

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string()
      public name: string

      public async handle () {
        const clients = await this.prompt.multiple('Select the installation client', ['npm', 'yarn'])
        this.$log(clients.join(','))
      }
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk']
    const command = kernel.find(argv)!
    const commandInstance = new command(true)

    /**
     * Responding to prompt programatically
     */
    commandInstance.prompt.on('prompt', (prompt) => {
      prompt.select(0)
    })

    await kernel.runCommand(argv, commandInstance)
    assert.deepEqual(commandInstance.logs, ['npm'])
  })

  test('test multiple prompt validation in raw mode', async (assert) => {
    assert.plan(2)

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string()
      public name: string

      public async handle () {
        const client = await this.prompt.multiple('Select the installation client', ['npm', 'yarn'], {
          validate (answer) {
            return answer.length > 0
          },
        })

        this.$log(client.join(','))
      }
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk']
    const command = kernel.find(argv)!
    const commandInstance = new command(true)

    /**
     * Responding to prompt programatically
     */
    commandInstance.prompt.on('prompt', (prompt) => {
      prompt.answer([])
    })

    commandInstance.prompt.on('prompt:error', (message) => {
      assert.equal(message, 'Enter the value')
    })

    await kernel.runCommand(argv, commandInstance)
    assert.deepEqual(commandInstance.logs, [''])
  })

  test('test toggle prompt in raw mode', async (assert) => {
    assert.plan(1)

    class Greet extends BaseCommand {
      public static commandName = 'greet'

      @args.string()
      public name: string

      public async handle () {
        const deleteFile = await this.prompt.toggle('Delete the file?', ['Yep', 'Nope'])
        this.$log(deleteFile ? 'Yep' : 'Nope')
      }
    }

    const kernel = new Kernel()
    kernel.register([Greet])

    const argv = ['greet', 'virk']
    const command = kernel.find(argv)!
    const commandInstance = new command(true)

    /**
     * Responding to prompt programatically
     */
    commandInstance.prompt.on('prompt', (prompt) => {
      prompt.accept()
    })

    await kernel.runCommand(argv, commandInstance)
    assert.deepEqual(commandInstance.logs, ['Yep'])
  })
})
