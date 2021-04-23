/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application } from '@adonisjs/application'

import { Kernel } from '../src/Kernel'
import { args } from '../src/Decorators/args'
import { flags } from '../src/Decorators/flags'
import { BaseCommand } from '../src/BaseCommand'
import { handleError } from '../src/utils/handleError'

class Greet extends BaseCommand {
  public static commandName = 'greet'
  public static description = 'Greet a user with their name'
  public static aliases = ['gr', 'sayhi']

  @args.string({ description: 'The name of the person you want to greet' })
  public name: string

  @args.string()
  public age?: string

  @args.spread()
  public files: string[]

  @flags.string({
    description: 'The environment to use to specialize certain commands',
    alias: 'e',
    async defaultValue(command: Greet) {
      return await command.prompt.choice('Select one of the given environments', [
        'development',
        'production',
      ])
    },
  })
  public env: 'development' | 'production'

  @flags.string({
    description: 'The main HTML file that will be requested',
    async defaultValue(command: Greet) {
      return await command.prompt.ask('Define entrypoint as we detected multiple?')
    },
  })
  public entrypoint: string

  @flags.numArray({ description: 'HTML fragments loaded on demand', alias: 'f' })
  public fragment: string

  public async run() {
    this.logger.success('Operation successful')
    this.logger.error('Unable to acquire lock')
    this.logger.info('Hello')
    this.logger.action('write').succeeded('Release notes')
    this.logger.action('write').skipped('Release notes')
    this.logger.info('Please get it done')
  }
}

class MakeController extends BaseCommand {
  public static commandName = 'make:controller'
  public static description = 'Create a HTTP controller'

  public async run() {}
}

class MakeModel extends BaseCommand {
  public static commandName = 'make:model'
  public static description = 'Create database model'

  public async run() {
    console.log(process.env.NODE_ENV)
  }
}

const app = new Application(__dirname, 'web', {})
const kernel = new Kernel(app)
kernel.register([Greet, MakeController, MakeModel])

kernel.flag(
  'help',
  (value, _, command) => {
    if (!value) {
      return
    }

    kernel.printHelp(command)
    process.exit(0)
  },
  { type: 'boolean' }
)

kernel.flag(
  'env',
  (value) => {
    process.env.NODE_ENV = value
  },
  { type: 'string' }
)

kernel.onExit(() => {
  if (kernel.error) {
    handleError(kernel.error)
  }
  process.exit(kernel.exitCode)
})

kernel.handle(process.argv.splice(2))
