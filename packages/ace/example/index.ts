/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { printHelp } from '../src/utils/help'
import { BaseCommand } from '../src/BaseCommand'
import { Kernel } from '../src/Kernel'

class Greet extends BaseCommand {
  public static commandName = 'greet'
  public static description = 'Greet a user with their name'
  public static args = [
    {
      name: 'name',
      description: 'The name of the person you want to greet',
      required: true,
    },
    {
      name: 'age',
      required: false,
    },
  ]

  public static flags = [
    {
      name: 'env',
      description: 'The environment to use to specialize certain commands',
      type: 'boolean',
    },
    {
      name: 'entrypoint',
      description: 'The main HTML file that will be requested',
      type: 'string',
    },
    {
      name: 'fragment',
      alias: 'f',
      description: 'HTML fragments loaded on demand',
      type: 'array',
    },
  ]
}

class MakeController extends BaseCommand {
  public static commandName = 'make:controller'
  public static description = 'Create a HTTP controller'
}

class MakeModel extends BaseCommand {
  public static commandName = 'make:model'
  public static description = 'Create database model'
}

const kernel = new Kernel()
kernel.flag('env', () => {}, { type: 'string' })
printHelp([Greet, MakeController, MakeModel], Object.keys(kernel.flags).map((flag) => {
  return kernel.flags[flag]
}))
