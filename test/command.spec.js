'use strict'

const test = require('japa')
const path = require('path')
const clearModule = require('clear-module')

let Command = require('../src/Command')
let commander = require('../lib/commander')

test.group('Command', (group) => {
  group.beforeEach(() => {
    clearModule('../lib/commander')
    clearModule('../src/Command')

    commander = require('../lib/commander')
    Command = require('../src/Command')
  })

  test('throw exception when command does not have handle method', (assert) => {
    class Foo extends Command {
      static get commandName () {
        return 'foo'
      }
    }
    Foo.boot()
    const fn = () => new Foo().handle()
    assert.throw(fn, 'Make sure to implement handle method for foo command')
  })

  test('throw exception when command does not have a name', (assert) => {
    class Generator extends Command {
    }
    const fn = () => Generator.boot()
    assert.throw(fn, 'Make sure to define the command name')
  })

  test('throw exception when adding argument without booting class', (assert) => {
    class Generator extends Command {
    }
    const fn = () => Generator.addArgument()
    assert.throw(fn, 'Make sure to call Generator.boot before adding arguments or options')
  })

  test('throw exception when adding option without booting class', (assert) => {
    class Generator extends Command {
    }
    const fn = () => Generator.addOption()
    assert.throw(fn, 'Make sure to call Generator.boot before adding arguments or options')
  })

  test('throw exception when argument does not have a name', (assert) => {
    class Generator extends Command {
      static get commandName () {
        return 'make:controller'
      }
    }
    const fn = () => Generator.boot().addArgument()
    assert.throw(fn, 'Cannot register argument without a name on make:controller command')
  })

  test('add argument to the command', (assert) => {
    class Generator extends Command {
      static get commandName () {
        return 'make:controller'
      }

      static boot () {
        super.boot()
        this.addArgument({
          name: 'name'
        })
      }
    }

    Generator.boot()
    assert.deepEqual(Generator.args, [{name: 'name', optional: false, defaultValue: null, description: ''}])
  })

  test('add option with a name', (assert) => {
    class Generator extends Command {
      static get commandName () {
        return 'make:controller'
      }

      static boot () {
        super.boot()
        this.addOption({
          name: '--file'
        })
      }
    }

    Generator.boot()
    assert.deepEqual(Generator.options, [{name: '--file', optional: false, defaultValue: null, description: ''}])
  })

  test('parse signature add set arguments', (assert) => {
    class Generator extends Command {
      static get signature () {
        return 'make:controller {name}'
      }
    }

    Generator.boot()
    assert.deepEqual(Generator.args, [{name: 'name', optional: false, defaultValue: null, description: ''}])
    assert.equal(Generator.commandName, 'make:controller')
  })

  test('return command output with name and description', (assert) => {
    class Generator extends Command {
      static get signature () {
        return 'make:controller'
      }

      static get description () {
        return 'Generate a controller'
      }
    }

    Generator.boot()
    const tokens = Generator.outputHelp(false).split('\n')
    assert.equal(tokens[0], 'Usage:')
    assert.equal(tokens[1].trim(), 'make:controller [options]')
    assert.equal(tokens[3].trim(), 'About:')
    assert.equal(tokens[4].trim(), 'Generate a controller')
  })

  test('return command output with arguments', (assert) => {
    class Generator extends Command {
      static get signature () {
        return 'make:controller {name}'
      }

      static get description () {
        return 'Generate a controller'
      }
    }

    Generator.boot()
    const tokens = Generator.outputHelp(false).split('\n')
    assert.equal(tokens[0], 'Usage:')
    assert.equal(tokens[1].trim(), 'make:controller <name> [options]')
    assert.equal(tokens[3].trim(), 'Arguments:')
    assert.equal(tokens[4].trim(), 'name')
    assert.equal(tokens[6].trim(), 'About:')
    assert.equal(tokens[7].trim(), 'Generate a controller')
  })

  test('return command output with multiple arguments', (assert) => {
    class Generator extends Command {
      static get signature () {
        return 'make:controller {name} {cFile: The file you want to use as template}'
      }

      static get description () {
        return 'Generate a controller'
      }
    }

    Generator.boot()
    const tokens = Generator.outputHelp(false).split('\n')
    assert.equal(tokens[0], 'Usage:')
    assert.equal(tokens[1].trim(), 'make:controller <name> <cFile> [options]')
    assert.equal(tokens[3].trim(), 'Arguments:')
    assert.equal(tokens[4].trim(), 'name')
    assert.equal(tokens[5].trim(), 'cFile   The file you want to use as template')
    assert.equal(tokens[7].trim(), 'About:')
    assert.equal(tokens[8].trim(), 'Generate a controller')
  })

  test('return command output with optional arguments', (assert) => {
    class Generator extends Command {
      static get signature () {
        return 'make:controller {name?} {cFile: The file you want to use as template}'
      }

      static get description () {
        return 'Generate a controller'
      }
    }

    Generator.boot()
    const tokens = Generator.outputHelp(false).split('\n')
    assert.equal(tokens[0], 'Usage:')
    assert.equal(tokens[1].trim(), 'make:controller [name] <cFile> [options]')
    assert.equal(tokens[3].trim(), 'Arguments:')
    assert.equal(tokens[4].trim(), 'name')
    assert.equal(tokens[5].trim(), 'cFile   The file you want to use as template')
    assert.equal(tokens[7].trim(), 'About:')
    assert.equal(tokens[8].trim(), 'Generate a controller')
  })

  test('return command output with options', (assert) => {
    class Generator extends Command {
      static get signature () {
        return 'make:controller {name?} {--file: The template file}'
      }

      static get description () {
        return 'Generate a controller'
      }
    }

    Generator.boot()
    const tokens = Generator.outputHelp(false).split('\n')
    assert.equal(tokens[0], 'Usage:')
    assert.equal(tokens[1].trim(), 'make:controller [name] [options]')
    assert.equal(tokens[3].trim(), 'Arguments:')
    assert.equal(tokens[4].trim(), 'name')
    assert.equal(tokens[6].trim(), 'Options:')
    assert.equal(tokens[7].trim(), '--file The template file')
    assert.equal(tokens[9].trim(), 'About:')
    assert.equal(tokens[10].trim(), 'Generate a controller')
  })

  test('return command output for options with value', (assert) => {
    class Generator extends Command {
      static get signature () {
        return 'make:controller {name?} {--file=@value: The template file}'
      }

      static get description () {
        return 'Generate a controller'
      }
    }

    Generator.boot()
    const tokens = Generator.outputHelp(false).split('\n')
    assert.equal(tokens[0], 'Usage:')
    assert.equal(tokens[1].trim(), 'make:controller [name] [options]')
    assert.equal(tokens[3].trim(), 'Arguments:')
    assert.equal(tokens[4].trim(), 'name')
    assert.equal(tokens[6].trim(), 'Options:')
    assert.equal(tokens[7].trim(), '--file <value> The template file')
    assert.equal(tokens[9].trim(), 'About:')
    assert.equal(tokens[10].trim(), 'Generate a controller')
  })

  test('return command output when defined options manually', (assert) => {
    class Generator extends Command {
      static get commandName () {
        return 'make:controller'
      }

      static get description () {
        return 'Generate a controller'
      }

      static boot () {
        super.boot()
        this.addArgument({ name: 'name', optional: true })
        this.addOption({ name: '--file', defaultValue: '@value', description: 'The template file' })
      }
    }

    Generator.boot()
    const tokens = Generator.outputHelp(false).split('\n')
    assert.equal(tokens[0], 'Usage:')
    assert.equal(tokens[1].trim(), 'make:controller [name] [options]')
    assert.equal(tokens[3].trim(), 'Arguments:')
    assert.equal(tokens[4].trim(), 'name')
    assert.equal(tokens[6].trim(), 'Options:')
    assert.equal(tokens[7].trim(), '--file <value> The template file')
    assert.equal(tokens[9].trim(), 'About:')
    assert.equal(tokens[10].trim(), 'Generate a controller')
  })

  test('register arguments with commander when calling wireUpWithCommander', (assert) => {
    class Generator extends Command {
      static get signature () {
        return 'make:controller {name}'
      }

      static get description () {
        return 'Generate a controller'
      }

      handle () {
        return 'foo'
      }
    }

    Generator.boot().wireUpWithCommander()
    assert.deepEqual(Generator.command._args, [{name: 'name', required: true, variadic: false}])
  })

  test('register multiple arguments with commander when calling wireUpWithCommander', (assert) => {
    class Generator extends Command {
      static get signature () {
        return 'make:controller {name} {file?}'
      }

      static get description () {
        return 'Generate a controller'
      }

      handle () {
        return 'foo'
      }
    }

    Generator.boot().wireUpWithCommander()
    assert.deepEqual(Generator.command._args, [
      {name: 'name', required: true, variadic: false},
      {name: 'file', required: false, variadic: false}
    ])
  })

  test('register options with commander when calling wireUpWithCommander', (assert) => {
    class Generator extends Command {
      static get signature () {
        return 'make:controller {name} {--file}'
      }

      static get description () {
        return 'Generate a controller'
      }

      handle () {
        return 'foo'
      }
    }

    Generator.boot().wireUpWithCommander()
    assert.equal(Generator.command.options[0].flags, '--file')
    assert.equal(Generator.command.options[0].optional, 0)
    assert.equal(Generator.command.options[0].long, '--file')
  })

  test('register options with description to commander when calling wireUpWithCommander', (assert) => {
    class Generator extends Command {
      static get signature () {
        return 'make:controller {name} {--file: Controller file}'
      }

      static get description () {
        return 'Generate a controller'
      }

      handle () {
        return 'foo'
      }
    }

    Generator.boot().wireUpWithCommander()
    assert.equal(Generator.command.options[0].flags, '--file')
    assert.equal(Generator.command.options[0].optional, 0)
    assert.equal(Generator.command.options[0].long, '--file')
    assert.equal(Generator.command.options[0].description, 'Controller file')
  })

  test('register optional options with description to commander', (assert) => {
    class Generator extends Command {
      static get signature () {
        return 'make:controller {name} {--file?: Controller file}'
      }

      static get description () {
        return 'Generate a controller'
      }

      handle () {
        return 'foo'
      }
    }

    Generator.boot().wireUpWithCommander()
    assert.equal(Generator.command.options[0].flags, '--file')
    assert.equal(Generator.command.options[0].required, 0)
    assert.equal(Generator.command.options[0].long, '--file')
    assert.equal(Generator.command.options[0].description, 'Controller file')
  })

  test('register options that accepts value with description to commander', (assert) => {
    class Generator extends Command {
      static get signature () {
        return 'make:controller {name} {--file?=@value: Controller file}'
      }

      static get description () {
        return 'Generate a controller'
      }

      handle () {
        return 'foo'
      }
    }

    Generator.boot().wireUpWithCommander()
    assert.equal(Generator.command.options[0].flags, '--file [value]')
    assert.equal(Generator.command.options[0].required, 0)
    assert.equal(Generator.command.options[0].long, '--file')
    assert.equal(Generator.command.options[0].description, 'Controller file')
  })

  test('create a new file to a given location', async (assert) => {
    const command = new Command()
    const foo = path.join(__dirname, '/foo.js')
    await command.writeFile(foo, `module.exports = 2`)
    assert.equal(require(foo), 2)
    await command.removeFile(foo)
  })

  test('empty directory', async (assert) => {
    const command = new Command()
    const tmp = path.join(__dirname, '/tmp')
    const foo = path.join(tmp, 'foo.js')
    await command.writeFile(foo, `module.exports = 2`)
    await command.emptyDir(tmp)
    assert.isTrue((await command.pathExists(tmp)))
    await command.removeDir(tmp)
  })

  test('ensure a file exists otherwise create one', async (assert) => {
    const command = new Command()
    const foo = path.join(__dirname, '/tmp', 'foo.js')
    await command.ensureFile(foo)
    assert.isTrue((await command.pathExists(foo)))
    await command.removeDir(path.join(__dirname, '/tmp'))
  })

  test('ensure a directory exists otherwise create one', async (assert) => {
    const command = new Command()
    const dir = path.join(__dirname, '/tmp')
    await command.ensureDir(dir)
    assert.isTrue((await command.pathExists(dir)))
    await command.removeDir(dir)
  })

  test('allow multi line signature', (assert) => {
    class Generator extends Command {
      static get signature () {
        return `
        make:controller
        { name : Name of the controller}
        { --force : Force command }
        `
      }
    }

    Generator.boot()
    assert.deepEqual(
      Generator.args,
      [{name: 'name', optional: false, defaultValue: null, description: 'Name of the controller'}]
    )

    assert.deepEqual(
      Generator.options,
      [{name: '--force', optional: false, defaultValue: null, description: 'Force command'}]
    )

    assert.equal(Generator.commandName, 'make:controller')
  })

  test('generate file from template', async (assert) => {
    const command = new Command()
    await command.generateFile(path.join(__dirname, 'sample.js'), `module.exports = '{{ name }}'`, { name: 'virk' })
    assert.equal(require(path.join(__dirname, 'sample.js')), 'virk')
    await command.removeFile(path.join(__dirname, 'sample.js'))
  })

  test('throw exception when file already exists', async (assert) => {
    assert.plan(1)
    const command = new Command()
    await command.generateFile(path.join(__dirname, 'sample.js'), `module.exports = '{{ name }}'`, { name: 'virk' })

    try {
      await command.generateFile(path.join(__dirname, 'sample.js'), `module.exports = '{{ name }}'`, { name: 'virk' })
    } catch ({ message }) {
      assert.match(message, /already exists/)
    }

    await command.removeFile(path.join(__dirname, 'sample.js'))
  })

  test('make sure all question methods can be called from command prototype', async (assert) => {
    const methods = ['ask', 'confirm', 'multiple', 'choice', 'secure', 'openEditor', 'anticipate', 'on']
    const command = new Command()
    methods.forEach((method) => {
      assert.isFunction(command[method])
    })
  })

  test('execute command from command line', async (assert) => {
    assert.plan(2)
    class Generator extends Command {
      static get signature () {
        return 'greet {name} {--admin}'
      }

      static get description () {
        return 'Generate a controller'
      }

      handle ({ name }, { admin }) {
        assert.equal(name, 'Virk')
        assert.isTrue(admin)
      }
    }

    Generator.boot()
    Generator.wireUpWithCommander()
    commander.parse(['node', 'test', 'greet', 'Virk', '--admin'])
  })

  test('define optional args', async (assert) => {
    assert.plan(1)
    class Generator extends Command {
      static get signature () {
        return 'foo {name?=virk}'
      }

      static get description () {
        return 'Generate a controller'
      }

      handle ({ name }) {
        assert.equal(name, 'virk')
      }
    }

    Generator.boot()
    Generator.wireUpWithCommander()
    commander.parse(['node', 'test', 'foo'])
  })

  test('should work with name argument', async (assert) => {
    assert.plan(1)
    class Generator extends Command {
      static get signature () {
        return 'foo {name}'
      }

      static get description () {
        return 'Generate a controller'
      }

      handle ({ name }) {
        assert.equal(name, 'virk')
      }
    }

    Generator.boot()
    Generator.wireUpWithCommander()
    commander.parse(['node', 'test', 'foo', 'virk'])
  })
})
