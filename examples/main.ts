/*
 * @adonisjs/ace
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Kernel } from '../src/kernel.js'
import { args } from '../src/decorators/args.js'
import { flags } from '../src/decorators/flags.js'
import { BaseCommand } from '../src/commands/base.js'
import { CommandsList } from '../src/loaders/list.js'
import { HelpCommand } from '../src/commands/help.js'

const kernel = new Kernel()

class Configure extends BaseCommand {
  static commandName: string = 'configure'
  static aliases: string[] = ['invoke']
  static description: string = 'Configure one or more AdonisJS packages'
}

class Build extends BaseCommand {
  static commandName: string = 'build'
  static description: string =
    'Compile project from Typescript to Javascript. Also compiles the frontend assets if using webpack encore'
}

class Repl extends BaseCommand {
  static commandName: string = 'repl'
  static description: string = 'Start a new REPL session'
}

class Serve extends BaseCommand {
  static commandName: string = 'serve'
  static description: string =
    'Start the AdonisJS HTTP server, along with the file watcher. Also starts the webpack dev server when webpack encore is installed'
}

class MakeController extends BaseCommand {
  @args.string({ description: 'Name of the controller' })
  name!: string

  @flags.boolean({ description: 'Add resourceful methods', default: false })
  resource!: boolean

  static commandName: string = 'make:controller'
  static aliases: string[] = ['mc']
  static description: string = 'Make a new HTTP controller'
}

class MakeModel extends BaseCommand {
  static commandName: string = 'make:model'
  static aliases: string[] = ['mm']
  static description: string = 'Make a new Lucid model'
}

class DbSeed extends BaseCommand {
  static commandName: string = 'db:seed'
  static description: string = 'Execute database seeders'
}

class DbTruncate extends BaseCommand {
  static commandName: string = 'db:truncate'
  static description: string = 'Truncate all tables in database'
}

class DbWipe extends BaseCommand {
  static commandName: string = 'db:wipe'
  static description: string = 'Drop all tables, views and types in database'
}

kernel.addLoader(
  new CommandsList([
    HelpCommand,
    Configure,
    Build,
    Serve,
    Repl,
    MakeController,
    MakeModel,
    DbSeed,
    DbTruncate,
    DbWipe,
  ])
)

kernel.addAlias('md', 'make:model')
kernel.addAlias('start', 'serve')

kernel.defineFlag('help', {
  type: 'boolean',
  alias: 'h',
  description:
    'Display help for the given command. When no command is given display help for the list command',
})

kernel.defineFlag('env', {
  type: 'string',
  description: 'The environment the command should run under',
})

kernel.defineFlag('ansi', {
  type: 'boolean',
  showNegatedVariantInHelp: true,
  description: 'Enable/disable colorful output',
})

kernel.on('ansi', (_, $kernel, options) => {
  if (options.flags.ansi === false) {
    $kernel.ui.switchMode('silent')
  }

  if (options.flags.ansi === true) {
    $kernel.ui.switchMode('normal')
  }
})

kernel.on('help', async (command, $kernel, options) => {
  options.args.unshift(command.commandName)
  await new HelpCommand($kernel, options, kernel.ui).exec()
  return true
})

kernel.info.set('binary', 'node ace')
kernel.info.set('Framework version', '9.1')
kernel.info.set('App version', '1.1.1')

await kernel.handle(process.argv.splice(2))
