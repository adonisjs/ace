/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import getopts from 'getopts'

import { Hooks } from '../Hooks'
import { Parser } from '../Parser'
import { Manifest } from '../Manifest'
import { validateCommand } from '../utils/validateCommand'
import { printHelp, printHelpFor } from '../utils/help'

import {
  CommandFlag,
  ManifestNode,
  CommandContract,
  ManifestCommand,
  RunHookCallback,
  FindHookCallback,
  GlobalFlagHandler,
  CommandConstructorContract,
} from '../Contracts'

/**
 * Ace kernel class is used to register, find and invoke commands by
 * parsing `process.argv.splice(2)` value.
 */
export class Kernel {
  /**
   * List of registered commands
   */
  public commands: { [name: string]: CommandConstructorContract } = {}

  /**
   * Reference to commands defined inside the manifest file. This only exists
   * when you call [[Kernel.useManifest]].
   */
  public manifestCommands?: ManifestNode

  /**
   * List of registered flags
   */
  public flags: { [name: string]: CommandFlag & { handler: GlobalFlagHandler } } = {}

  /**
   * Reference to the manifest instance. When this exists, the kernel
   * will give prefrence to the manifest file over the registered
   * commands
   */
  private _manifest?: Manifest

  /**
   * Reference to hooks class to execute lifecycle
   * hooks
   */
  private _hooks = new Hooks()

  /**
   * Executing global flag handlers. The global flag handlers are
   * not async as of now, but later we can look into making them
   * async.
   */
  private _executeGlobalFlagsHandlers (
    options: getopts.ParsedOptions,
    command?: CommandConstructorContract,
  ) {
    const globalFlags = Object.keys(this.flags)

    globalFlags.forEach((name) => {
      const value = options[name]

      /**
       * Flag was not specified
       */
      if (value === undefined) {
        return
      }

      /**
       * Flag was not specified, but `getops` will return empty array or
       * empty string, when we coerce flag to be a string or array
       */
      if ((typeof (value) === 'string' || Array.isArray(value)) && !value.length) {
        return
      }

      /**
       * Calling the handler
       */
      this.flags[name].handler(options[name], options, command)
    })
  }

  /**
   * Register a before hook
   */
  public before (action: 'run', callback: RunHookCallback): this
  public before (action: 'find', callback: FindHookCallback): this
  public before (action: 'run' | 'find', callback: RunHookCallback | FindHookCallback): this {
    this._hooks.add('before', action, callback)
    return this
  }

  /**
   * Register an after hook
   */
  public after (action: 'run', callback: RunHookCallback): this
  public after (action: 'find', callback: FindHookCallback): this
  public after (action: 'run' | 'find', callback: RunHookCallback | FindHookCallback): this {
    this._hooks.add('after', action, callback)
    return this
  }

  /**
   * Register an array of commands
   */
  public register (commands: CommandConstructorContract[]): this {
    commands.forEach((command) => {
      validateCommand(command)
      this.commands[command.commandName] = command
    })

    return this
  }

  /**
   * Returns an array of command names suggestions for a given name.
   */
  public getSuggestions (name: string, distance = 3): string[] {
    const levenshtein = require('fast-levenshtein')
    const commands = this.manifestCommands ? this.manifestCommands : this.commands
    return Object.keys(commands).filter((commandName) => {
      return levenshtein.get(name, commandName) <= distance
    })
  }

  /**
   * Register a global flag to be set on any command. The flag callback is
   * executed before executing the registered command.
   */
  public flag (
    name: string,
    handler: GlobalFlagHandler,
    options: Partial<Exclude<CommandFlag, 'name' | 'propertyName'>>,
  ): this {
    this.flags[name] = Object.assign({
      name,
      propertyName: name,
      handler,
      type: 'boolean',
    }, options)

    return this
  }

  /**
   * Finds the command from the command line argv array. If command for
   * the given name doesn't exists, then it will return `null`.
   */
  public async find (argv: string[]): Promise<CommandConstructorContract | null> {
    /**
     * ----------------------------------------------------------------------------
     * Even though in `Unix` the command name may appear in between or at last, with
     * ace we always want the command name to be the first argument. However, the
     * arguments to the command itself can appear in any sequence. For example:
     *
     * Works
     *    - node ace make:controller foo
     *    - node ace make:controller --http foo
     *
     * Doesn't work
     *    - node ace foo make:controller
     * ----------------------------------------------------------------------------
     */

    /**
     * Manifest commands gets preference over manually registered commands.
     */
    if (this.manifestCommands && this.manifestCommands[argv[0]]) {
      /**
       * Passing manifest node to the command
       */
      await this._hooks.excute('before', 'find', this.manifestCommands[argv[0]])
      const command = this._manifest!.loadCommand(this.manifestCommands[argv[0]].commandPath)

      /**
       * Passing actual command constructor
       */
      await this._hooks.excute('after', 'find', command)
      return command
    }

    /**
     * Try to find command inside manually registered command or fallback
     * to null
     */
    const command = this.commands[argv[0]] || null

    /**
     * Executing before and after together to be compatible
     * with the manifest find before and after hooks
     */
    await this._hooks.excute('before', 'find', command)
    await this._hooks.excute('after', 'find', command)

    return command
  }

  /**
   * Run a given command by parsing the command line arguments
   */
  public async runCommand (argv: string[], commandInstance: CommandContract) {
    /**
     * The first value in the `argv` array is the command name. Now since
     * we know the command already, we remove the first value.
     */
    argv = argv.splice(1)

    const parser = new Parser(this.flags)
    const command = commandInstance.constructor as CommandConstructorContract

    /**
     * Parse argv and execute the `handle` method.
     */
    const parsedOptions = parser.parse(argv, command)
    this._executeGlobalFlagsHandlers(parsedOptions, command)

    /**
     * We validate the command arguments after the global flags have been
     * executed. It is required, since flags may have nothing to do
     * with the validaty of command itself
     */
    command.args.forEach((arg, index) => {
      parser.validateArg(arg, index, parsedOptions, command)
    })

    /**
     * Creating a new command instance and setting
     * parsed options on it.
     */
    commandInstance.parsed = parsedOptions

    /**
     * Setup command instance argument and flag
     * properties.
     */
    for (let i = 0; i < command.args.length; i++) {
      const arg = command.args[i]
      if (arg.type === 'spread') {
        commandInstance[arg.propertyName] = parsedOptions._.slice(i)
        break
      } else {
        commandInstance[arg.propertyName] = parsedOptions._[i]
      }
    }

    /**
     * Set flag value on the command instance
     */
    command.flags.forEach((flag) => {
      commandInstance[flag.propertyName] = parsedOptions[flag.name]
    })

    await this._hooks.excute('before', 'run', commandInstance)
    const response = await commandInstance.handle()
    await this._hooks.excute('after', 'run', commandInstance)

    return response
  }

  /**
   * Makes instance of a given command by processing command line arguments
   * and setting them on the command instance
   */
  public async handle (argv: string[]) {
    if (!argv.length) {
      return
    }

    /**
     * Load manifest commands when instance of manifest exists. From here the
     * kernel will give preference to the `manifest` file vs manually
     * registered commands.
     */
    if (this._manifest) {
      this.manifestCommands = await this._manifest.load()
    }

    const hasMentionedCommand = !argv[0].startsWith('-')

    /**
     * Parse flags when no command is defined
     */
    if (!hasMentionedCommand) {
      const parsedOptions = new Parser(this.flags).parse(argv)
      this._executeGlobalFlagsHandlers(parsedOptions)
      return
    }

    /**
     * If command doesn't exists, then raise an error for same
     */
    let command = await this.find(argv)
    if (!command) {
      throw new Error(`${argv[0]} is not a registered command`)
    }

    return this.runCommand(argv, new command())
  }

  /**
   * Use manifest instance to lazy load commands
   */
  public useManifest (manifest: Manifest): this {
    this._manifest = manifest
    return this
  }

  /**
   * Print the help screen for a given command or all commands/flags
   */
  public printHelp (command?: CommandConstructorContract) {
    if (command) {
      printHelpFor(command)
    } else {
      let commands: ManifestCommand[] | CommandConstructorContract[]

      /**
       * Using manifest commands over registered commands
       */
      if (this.manifestCommands) {
        commands = Object.keys(this.manifestCommands).map((name) => this.manifestCommands![name])
      } else {
        commands = Object.keys(this.commands).map((name) => this.commands[name])
      }

      const flags = Object.keys(this.flags).map((name) => this.flags[name])
      printHelp(commands, flags)
    }
  }
}
