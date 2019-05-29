/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { BaseCommand } from '../src/BaseCommand'
import { Kernel } from '../src/Kernel'
import { args } from '../src/Decorators/args'
import { flags } from '../src/Decorators/flags'

class Greet extends BaseCommand {
  public static commandName = 'greet'
  public static description = 'Greet a user with their name'

  @args.string({ description: 'The name of the person you want to greet' })
  public name: string

  @args.string()
  public age: number

  @flags.string({ description: 'The environment to use to specialize certain commands' })
  public env: string

  @flags.string({ description: 'The main HTML file that will be requested' })
  public entrypoint: string

  @flags.array({ description: 'HTML fragments loaded on demand', alias: 'f' })
  public fragment: string

  public async handle () {
    console.log(typeof (this.age))
  }
}

class MakeController extends BaseCommand {
  public static commandName = 'make:controller'
  public static description = 'Create a HTTP controller'
}

class MakeModel extends BaseCommand {
  public static commandName = 'make:model'
  public static description = 'Create database model'

  public async handle () {
    console.log(process.env.NODE_ENV)
  }
}

const kernel = new Kernel()
kernel.register([Greet, MakeController, MakeModel])

kernel.flag('env', (value) => {
  process.env.NODE_ENV = value
}, { type: 'string' })

kernel.handle(process.argv.splice(2))
kernel.printHelp(Greet)
