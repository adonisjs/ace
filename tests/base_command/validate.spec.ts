/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Parser } from '../../src/parser.js'
import { CommandOptions } from '../../src/types.js'
import { BaseCommand } from '../../src/commands/base.js'

test.group('Base command | validate args', () => {
  test('fail when required argument value is missing', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineArgument('name', { type: 'string' })
    const output = new Parser(MakeModel.getParserOptions()).parse('')

    assert.throws(() => MakeModel.validate(output), 'Missing required argument "name"')
  })

  test('allow missing value when argument is optional', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineArgument('name', { type: 'string' })
    MakeModel.defineArgument('connection', { type: 'string', required: false })
    const output = new Parser(MakeModel.getParserOptions()).parse('user')

    assert.doesNotThrows(() => MakeModel.validate(output))
  })

  test('fail when spread argument value is missing', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineArgument('name', { type: 'string' })
    MakeModel.defineArgument('connections', { type: 'spread' })
    const output = new Parser(MakeModel.getParserOptions()).parse('user')

    assert.throws(() => MakeModel.validate(output), 'Missing required argument "connections"')
  })

  test('allow missing value for optional spread argument', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineArgument('name', { type: 'string' })
    MakeModel.defineArgument('connections', { type: 'spread', required: false })
    const output = new Parser(MakeModel.getParserOptions()).parse('user')

    assert.doesNotThrows(() => MakeModel.validate(output))
  })

  test('fail when optional argument receives empty value', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineArgument('name', { type: 'string', required: false })
    const output = new Parser(MakeModel.getParserOptions()).parse([''])

    assert.throws(() => MakeModel.validate(output), 'Missing value for argument "name"')
  })

  test('fail when required argument receives empty value', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineArgument('name', { type: 'string', required: true })
    const output = new Parser(MakeModel.getParserOptions()).parse([''])

    assert.throws(() => MakeModel.validate(output), 'Missing value for argument "name"')
  })

  test('work fine when required argument allows empty values', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineArgument('name', { type: 'string', required: true, allowEmptyValue: true })
    const output = new Parser(MakeModel.getParserOptions()).parse([''])

    assert.doesNotThrows(() => MakeModel.validate(output))
  })

  test('work fine when optional argument allows empty values', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineArgument('name', { type: 'string', required: false, allowEmptyValue: true })
    const output = new Parser(MakeModel.getParserOptions()).parse([''])

    assert.doesNotThrows(() => MakeModel.validate(output))
  })
})

test.group('Base command | validate unknown flags', () => {
  test('fail when unknown flags are specified', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('connection', { type: 'string' })
    MakeModel.defineArgument('name', { type: 'string' })

    const output = new Parser(MakeModel.getParserOptions()).parse(
      'foo --connection=sqlite --drop-all'
    )

    assert.throws(() => MakeModel.validate(output), 'Unknown flag "--drop-all"')
  })

  test('fail when unknown shorthand flags are specified', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('connection', { type: 'string' })
    MakeModel.defineArgument('name', { type: 'string' })

    const output = new Parser(MakeModel.getParserOptions()).parse('foo --connection=sqlite -d')
    assert.throws(() => MakeModel.validate(output), 'Unknown flag "-d"')
  })

  test('do not fail when argument value starts with --', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('connection', { type: 'string' })
    MakeModel.defineArgument('name', { type: 'string' })

    const output = new Parser(MakeModel.getParserOptions()).parse('"--da" --connection=sqlite')
    assert.doesNotThrows(() => MakeModel.validate(output), 'Unknown flag "-da"')
  })

  test('allow unknown flags', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
      static options: CommandOptions = {
        allowUnknownFlags: true,
      }
    }

    MakeModel.defineFlag('connection', { type: 'string' })
    MakeModel.defineArgument('name', { type: 'string' })

    const output = new Parser(MakeModel.getParserOptions()).parse('user --connection=sqlite -da')
    assert.doesNotThrows(() => MakeModel.validate(output))
  })
})

test.group('Base command | validate string flag', () => {
  test('fail when a required string flag is missing', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('connection', { type: 'string', required: true })
    const output = new Parser(MakeModel.getParserOptions()).parse('')

    assert.throws(() => MakeModel.validate(output), 'Missing required option "connection"')
  })

  test('fail when a required string flag is defined without any value', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('connection', { type: 'string', required: true })
    const output = new Parser(MakeModel.getParserOptions()).parse('--connection')

    assert.throws(() => MakeModel.validate(output), 'Missing value for option "connection"')
  })

  test('work fine when an optional string is missing', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('connection', { type: 'string' })
    const output = new Parser(MakeModel.getParserOptions()).parse('')

    assert.doesNotThrows(() => MakeModel.validate(output))
  })

  test('fail when a optional string flag is defined without any value', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('connection', { type: 'string' })
    const output = new Parser(MakeModel.getParserOptions()).parse('--connection')

    assert.throws(() => MakeModel.validate(output), 'Missing value for option "connection"')
  })

  test('use default value when flag is not mentioned', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('connection', { type: 'string', required: true, default: 'sqlite' })
    const output = new Parser(MakeModel.getParserOptions()).parse('')

    assert.equal(output.flags.connection, 'sqlite')
    assert.doesNotThrows(() => MakeModel.validate(output))
  })

  test('work fine when an optional string flag is mentioned without value and empty values are allowed', ({
    assert,
  }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('connection', { type: 'string', allowEmptyValue: true })
    const output = new Parser(MakeModel.getParserOptions()).parse('--connection')

    assert.doesNotThrows(() => MakeModel.validate(output))
  })

  test('fail when required string flag is not mentioned and empty values are allowed', ({
    assert,
  }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('connection', { type: 'string', allowEmptyValue: true, required: true })
    const output = new Parser(MakeModel.getParserOptions()).parse('')

    assert.throws(() => MakeModel.validate(output), 'Missing required option "connection"')
  })
})

test.group('Base command | validate numeric flag', () => {
  test('fail when a required numeric flag is missing', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('batchSize', { type: 'number', required: true })
    const output = new Parser(MakeModel.getParserOptions()).parse('')

    assert.throws(() => MakeModel.validate(output), 'Missing required option "batch-size"')
  })

  test('fail when a required numeric flag is defined without any value', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('batchSize', { type: 'number', required: true })
    const output = new Parser(MakeModel.getParserOptions()).parse('--batch-size')

    assert.throws(() => MakeModel.validate(output), 'Missing value for option "batch-size"')
  })

  test('work fine when an optional numeric flag is missing', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('batchSize', { type: 'number' })
    const output = new Parser(MakeModel.getParserOptions()).parse('')

    assert.doesNotThrows(() => MakeModel.validate(output))
  })

  test('fail when an optional numeric flag is defined without any value', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('batchSize', { type: 'number' })
    const output = new Parser(MakeModel.getParserOptions()).parse('--batch-size')

    assert.throws(() => MakeModel.validate(output), 'Missing value for option "batch-size"')
  })

  test('fail when numeric flag value is not a valid number', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('batchSize', { type: 'number' })
    const output = new Parser(MakeModel.getParserOptions()).parse('--batch-size=foo')

    assert.throws(
      () => MakeModel.validate(output),
      'Invalid value. The "batch-size" flag accepts a "numeric" value'
    )
  })
})

test.group('Base command | validate boolean flag', () => {
  test('ignore values next to a boolean flag', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('dropAll', { type: 'boolean', required: true })
    const output = new Parser(MakeModel.getParserOptions()).parse('--drop-all=no')

    assert.doesNotThrows(() => MakeModel.validate(output))
  })

  test('set value to true when boolean flag is mentioned', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('dropAll', { type: 'boolean', required: true })
    const output = new Parser(MakeModel.getParserOptions()).parse('--drop-all')
    assert.isTrue(output.flags['drop-all'])
    assert.doesNotThrows(() => MakeModel.validate(output))
  })

  test('fail when a required boolean flag is missing', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('dropAll', { type: 'boolean', required: true })
    const output = new Parser(MakeModel.getParserOptions()).parse('')

    assert.throws(() => MakeModel.validate(output), 'Missing required option "drop-all"')
  })

  test('work fine when an optional boolean flag is missing', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('dropAll', { type: 'boolean' })
    const output = new Parser(MakeModel.getParserOptions()).parse('')

    assert.doesNotThrows(() => MakeModel.validate(output))
  })
})

test.group('Base command | validate array flag', () => {
  test('fail when a required array flag is missing', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('connection', { type: 'array', required: true })
    const output = new Parser(MakeModel.getParserOptions()).parse('')

    assert.throws(() => MakeModel.validate(output), 'Missing required option "connection"')
  })

  test('fail when a required array flag is mentioned with no value', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('connections', { type: 'array', required: true })
    const output = new Parser(MakeModel.getParserOptions()).parse('--connections')

    assert.throws(() => MakeModel.validate(output), 'Missing value for option "connections"')
  })

  test('fail when a required array flag is mentioned multiple times with no value', ({
    assert,
  }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('connections', { type: 'array', required: true })
    const output = new Parser(MakeModel.getParserOptions()).parse('--connections --connections')

    assert.throws(() => MakeModel.validate(output), 'Missing value for option "connections"')
  })

  test('when fine when an optional array flag is missing', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('connection', { type: 'array' })
    const output = new Parser(MakeModel.getParserOptions()).parse('')

    assert.doesNotThrows(() => MakeModel.validate(output))
  })

  test('fail when an optional array flag is mentioned with no value', ({ assert }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('connections', { type: 'array', required: false })
    const output = new Parser(MakeModel.getParserOptions()).parse('--connections --connections')

    assert.throws(() => MakeModel.validate(output), 'Missing value for option "connections"')
  })

  test('work fine when an optional array flag is mentioned without value and empty values are allowed', ({
    assert,
  }) => {
    class MakeModel extends BaseCommand {
      static commandName: string = 'migrate'
      static description: string = 'Migrate db'
    }

    MakeModel.defineFlag('connections', { type: 'array', required: false, allowEmptyValue: true })
    const output = new Parser(MakeModel.getParserOptions()).parse('--connections --connections')

    assert.doesNotThrows(() => MakeModel.validate(output))
  })
})
